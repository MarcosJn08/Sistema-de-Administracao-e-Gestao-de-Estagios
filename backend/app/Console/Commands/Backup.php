<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;
use Symfony\Component\Process\Process;
use ZipArchive;

class Backup extends Command
{
    protected $signature = 'sage:backup';

    protected $description = 'Cria backup local do banco e documentos privados (SQLite, MySQL/MariaDB ou PostgreSQL).';

    public function handle(): int
    {
        $directory = config('backup.path');
        File::ensureDirectoryExists($directory, 0700);
        $name = 'sage-'.now()->format('Ymd-His').'-'.Str::uuid();
        $work = $directory.'/'.$name;
        File::makeDirectory($work, 0700);
        $zipPath = $directory.'/'.$name.'.zip';
        $mask = umask(0077);
        try {
            $connection = DB::connection();
            $config = $connection->getConfig();
            $driver = $connection->getDriverName();
            $dump = $work.($driver === 'sqlite' ? '/database.sqlite' : '/database.sql');
            if ($driver === 'sqlite') {
                $connection->getPdo()->exec('VACUUM INTO '.$connection->getPdo()->quote($dump));
            } elseif (in_array($driver, ['mysql', 'mariadb'], true)) {
                $args = [$driver === 'mariadb' ? 'mariadb-dump' : 'mysqldump', '--single-transaction', '--skip-lock-tables', '--no-tablespaces', '--host='.$config['host'], '--port='.($config['port'] ?? 3306), '--user='.$config['username'], '--result-file='.$dump];
                if (! empty($config['unix_socket'])) {
                    $args[] = '--socket='.$config['unix_socket'];
                }
                $args[] = $config['database'];
                $process = new Process($args, null, ['MYSQL_PWD' => $config['password'] ?? '']);
                $process->setTimeout(600)->run();
                if (! $process->isSuccessful()) {
                    throw new \RuntimeException('Falha no dump MySQL/MariaDB. Verifique cliente, conexão e permissões.');
                }
            } elseif ($driver === 'pgsql') {
                $process = new Process(['pg_dump', '--host='.$config['host'], '--port='.($config['port'] ?? 5432), '--username='.$config['username'], '--no-password', '--file='.$dump, $config['database']], null, ['PGPASSWORD' => $config['password'] ?? '']);
                $process->setTimeout(600)->run();
                if (! $process->isSuccessful()) {
                    throw new \RuntimeException('Falha no dump PostgreSQL. Verifique cliente, conexão e permissões.');
                }
            } else {
                throw new \RuntimeException('Driver de banco não suportado pelo backup.');
            }
            $zip = new ZipArchive;
            if ($zip->open($zipPath, ZipArchive::CREATE | ZipArchive::EXCL) !== true) {
                throw new \RuntimeException('Não foi possível criar o arquivo de backup.');
            }
            if (! $zip->addFile($dump, basename($dump))) {
                throw new \RuntimeException('Falha ao adicionar o banco ao backup.');
            }
            $private = rtrim(config('filesystems.disks.local.root'), '/').'/documentos';
            if (File::isDirectory($private)) {
                foreach (File::allFiles($private) as $file) {
                    if (! $zip->addFile($file->getPathname(), 'documentos/'.$file->getRelativePathname())) {
                        throw new \RuntimeException('Falha ao adicionar documento ao backup.');
                    }
                }
            }
            $zip->addFromString('manifest.json', json_encode(['created_at' => now()->toIso8601String(), 'driver' => $driver, 'database_sha256' => hash_file('sha256', $dump)], JSON_PRETTY_PRINT | JSON_THROW_ON_ERROR));
            if (! $zip->close()) {
                throw new \RuntimeException('Falha ao finalizar o backup.');
            }
            chmod($zipPath, 0600);
            Log::info('backup.completed', ['file' => basename($zipPath)]);
            $this->info('Backup criado: '.$zipPath);

            return self::SUCCESS;
        } catch (\Throwable $exception) {
            File::delete($zipPath);
            Log::error('backup.failed', ['exception' => $exception::class]);
            $this->error('Backup falhou. Verifique espaço em disco, extensões, cliente do banco e permissões.');

            return self::FAILURE;
        } finally {
            File::deleteDirectory($work);
            umask($mask);
        }
    }
}

<?php

namespace Tests\Feature;

use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Str;
use Tests\TestCase;
use ZipArchive;

class BackupTest extends TestCase
{
    public function test_backup_contains_restorable_database_and_manifest(): void
    {
        $directory = sys_get_temp_dir().'/sage-backup-test-'.Str::uuid();
        File::makeDirectory($directory, 0700);
        $connection = config('database.default');
        config(['database.default' => 'backup_test', 'database.connections.backup_test' => ['driver' => 'sqlite', 'database' => ':memory:', 'prefix' => ''], 'backup.path' => $directory, 'filesystems.disks.local.root' => $directory.'/private']);
        try {
            File::ensureDirectoryExists($directory.'/private/documentos', 0700);
            File::put($directory.'/private/documentos/test.pdf', 'private document bytes');
            DB::statement('CREATE TABLE backup_check (id INTEGER PRIMARY KEY, value TEXT)');
            DB::insert('INSERT INTO backup_check (value) VALUES (?)', ['preserved']);
            $this->artisan('sage:backup')->assertSuccessful();
            $archives = glob($directory.'/*.zip');
            $this->assertCount(1, $archives);
            $zip = new ZipArchive;
            $this->assertTrue($zip->open($archives[0]));
            $this->assertSame('private document bytes', $zip->getFromName('documentos/test.pdf'));
            $manifest = json_decode($zip->getFromName('manifest.json'), true);
            $bytes = $zip->getFromName('database.sqlite');
            $this->assertSame(hash('sha256', $bytes), $manifest['database_sha256']);
            file_put_contents($directory.'/restored.sqlite', $bytes);
            $pdo = new \PDO('sqlite:'.$directory.'/restored.sqlite');
            $this->assertSame('preserved', $pdo->query('SELECT value FROM backup_check')->fetchColumn());
            $zip->close();
            if (PHP_OS_FAMILY !== 'Windows') {
                $this->assertSame(0600, fileperms($archives[0]) & 0777);
            }
        } finally {
            DB::purge('backup_test');
            config(['database.default' => $connection]);
            File::deleteDirectory($directory);
        }
    }
}

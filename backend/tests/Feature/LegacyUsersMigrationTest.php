<?php

namespace Tests\Feature;

use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use PHPUnit\Framework\Attributes\DataProvider;
use Tests\TestCase;

class LegacyUsersMigrationTest extends TestCase
{
    protected function setUp(): void
    {
        parent::setUp();

        $this->assertSame('sqlite', DB::connection()->getDriverName());
        $this->assertSame(':memory:', DB::connection()->getDatabaseName());
    }

    public function test_migrations_run_on_a_new_database(): void
    {
        $this->assertFalse(Schema::hasTable('usuarios'));

        $this->migrarBancoCompleto();

        $this->assertTrue(Schema::hasColumns('usuarios', ['nome', 'perfil', 'status', 'role', 'is_active']));
        $this->assertFalse(Schema::hasTable('users'));
        $this->assertDatabaseCount('usuarios', 0);
    }

    public static function colunasLegadas(): array
    {
        return [
            'com role e is_active' => [true, true],
            'sem role e is_active' => [false, false],
            'somente role' => [true, false],
            'somente is_active' => [false, true],
        ];
    }

    #[DataProvider('colunasLegadas')]
    public function test_migrations_preserve_legacy_accounts(bool $comRole, bool $comIsActive): void
    {
        $this->artisan('migrate', [
            '--path' => 'database/migrations/0001_01_01_000000_create_users_table.php',
        ])->assertSuccessful();

        // Simula a primeira migração registrada quando o projeto ainda criava users.
        Schema::drop('usuarios');
        Schema::create('users', function (Blueprint $table) use ($comRole, $comIsActive): void {
            $table->id();
            $table->string('name');
            $table->string('email')->unique();
            $table->string('password');
            $table->timestamps();

            if ($comRole) {
                $table->string('role', 20)->nullable()->index();
            }

            if ($comIsActive) {
                $table->boolean('is_active')->default(true);
            }
        });

        $contas = [
            ['id' => 17, 'name' => 'Direção de teste', 'email' => 'direcao@example.test', 'role' => 'diretor', 'is_active' => false],
            ['id' => 42, 'name' => 'Professor de teste', 'email' => 'professor@example.test', 'role' => 'professor', 'is_active' => true],
        ];

        foreach ($contas as &$conta) {
            $conta['password'] = password_hash('senha de teste '.$conta['id'], PASSWORD_BCRYPT, ['cost' => 4]);
            $dados = $conta;
            if (! $comRole) {
                unset($dados['role']);
            }
            if (! $comIsActive) {
                unset($dados['is_active']);
            }
            DB::table('users')->insert($dados);
        }
        unset($conta);

        $this->migrarBancoCompleto();

        $this->assertFalse(Schema::hasTable('users'));
        $this->assertDatabaseCount('usuarios', count($contas));
        foreach ($contas as $conta) {
            $this->assertDatabaseHas('usuarios', [
                'id' => $conta['id'],
                'name' => $conta['name'],
                'nome' => $conta['name'],
                'email' => $conta['email'],
                'password' => $conta['password'],
                'perfil' => $comRole ? strtoupper($conta['role']) : 'ALUNO',
                'status' => $comIsActive && ! $conta['is_active'] ? 'inativo' : 'ativo',
                'role' => $comRole ? $conta['role'] : null,
                'is_active' => $comIsActive ? $conta['is_active'] : true,
            ]);
        }
    }

    private function migrarBancoCompleto(): void
    {
        $this->artisan('migrate')->assertSuccessful();

        $esperadas = array_map(
            fn (string $arquivo): string => pathinfo($arquivo, PATHINFO_FILENAME),
            glob(database_path('migrations/*.php')),
        );

        $this->assertEqualsCanonicalizing($esperadas, DB::table('migrations')->pluck('migration')->all());
    }
}

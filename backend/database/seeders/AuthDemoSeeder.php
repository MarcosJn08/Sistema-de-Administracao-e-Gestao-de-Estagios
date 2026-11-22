<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use RuntimeException;

class AuthDemoSeeder extends Seeder
{
    public function run(): void
    {
        if (! app()->environment(['local', 'testing'])) {
            throw new RuntimeException('Contas de demonstração são permitidas somente em local/testing.');
        }

        $password = config('auth.demo_password');
        if (! is_string($password) || strlen($password) < 8) {
            throw new RuntimeException('Defina AUTH_DEMO_PASSWORD com pelo menos 8 caracteres antes de executar este seeder.');
        }

        $accounts = [
            ['name' => 'Aluno demonstração', 'email' => 'aluno.demo@aluno.ifnmg.edu.br', 'role' => 'aluno', 'matricula' => '202600000001'],
            ['name' => 'Professor demonstração', 'email' => 'professor.demo@ifnmg.edu.br', 'role' => 'professor', 'siape' => '9000001'],
            ['name' => 'Diretor demonstração', 'email' => 'diretor.demo@ifnmg.edu.br', 'role' => 'diretor', 'siape' => '9000002'],
            ['name' => 'Empresa demonstração', 'email' => 'empresa.demo@example.com', 'role' => 'empresa', 'cnpj' => '11222333000181'],
        ];

        $resetPasswords = (bool) config('auth.demo_reset_passwords');
        $result = DB::transaction(function () use ($accounts, $password, $resetPasswords): array {
            $created = 0;
            $updated = 0;

            foreach ($accounts as $account) {
                $existing = User::query()->where('email', $account['email'])->first();
                if ($existing) {
                    if ($resetPasswords && $existing->role === $account['role']) {
                        $existing->password = $password;
                        $existing->save();
                        $updated++;
                    }

                    continue;
                }

                $user = new User;
                $user->forceFill([...$account, 'password' => $password, 'is_active' => true]);
                $user->save();
                $created++;
            }

            return ['created' => $created, 'updated' => $updated];
        });

        $preserved = count($accounts) - $result['created'] - $result['updated'];
        $this->command?->info("{$result['created']} usuários criados; {$result['updated']} senhas atualizadas; {$preserved} contas preservadas.");
    }
}

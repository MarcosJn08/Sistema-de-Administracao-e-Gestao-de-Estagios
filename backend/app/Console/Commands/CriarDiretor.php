<?php

namespace App\Console\Commands;

use App\Enums\UserRole;
use App\Models\Usuario;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rules\Password;

class CriarDiretor extends Command
{
    protected $signature = 'sage:criar-diretor {email} {--nome=}';

    protected $description = 'Cria um diretor com senha informada de forma oculta, sem credenciais padrão.';

    public function handle(): int
    {
        if (! $this->input->isInteractive()) {
            $this->error('Execute interativamente para informar a senha com segurança.');

            return self::FAILURE;
        }
        $password = $this->secret('Senha (mínimo 12 caracteres, letras e números)');
        $data = ['email' => strtolower($this->argument('email')), 'nome' => $this->option('nome') ?: $this->ask('Nome'), 'password' => $password];
        $validator = Validator::make($data, ['email' => 'required|email|max:255|unique:usuarios,email', 'nome' => 'required|string|max:255', 'password' => ['required', 'string', 'max:255', Password::min(12)->letters()->numbers()]]);
        if ($validator->fails()) {
            foreach ($validator->errors()->all() as $error) {
                $this->error($error);
            }

            return self::FAILURE;
        }
        Usuario::create($data + ['perfil' => UserRole::DIRETOR, 'status' => 'ativo']);
        $this->info('Diretor criado.');

        return self::SUCCESS;
    }
}

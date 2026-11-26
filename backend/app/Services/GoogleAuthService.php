<?php

namespace App\Services;

use App\Models\User;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;
use Laravel\Socialite\Contracts\User as SocialiteUser;

class GoogleAuthService
{
    public const DOMINIOS_PERMITIDOS = [
        'aluno.ifnmg.edu.br',
        'ifnmg.edu.br',
    ];

    public function validarDominioInstitucional(string $email): string
    {
        $email = Str::lower(trim($email));
        $partes = explode('@', $email);

        if (count($partes) !== 2) {
            throw ValidationException::withMessages([
                'email' => ['Formato de e-mail inválido.'],
            ]);
        }

        $dominio = $partes[1];

        if (! in_array($dominio, self::DOMINIOS_PERMITIDOS, true)) {
            throw ValidationException::withMessages([
                'email' => ['No login com Google, apenas contas institucionais (@aluno.ifnmg.edu.br ou @ifnmg.edu.br) são permitidas.'],
            ]);
        }

        return $dominio === 'aluno.ifnmg.edu.br' ? 'aluno' : 'professor';
    }

    public function autenticarOuProvisionar(SocialiteUser $googleUser): array
    {
        $email = Str::lower(trim($googleUser->getEmail()));
        $role = $this->validarDominioInstitucional($email);

        $user = User::whereRaw('LOWER(email) = ?', [$email])->first();

        if ($user) {
            if ($user->status === 'inativo' || (isset($user->is_active) && ! $user->is_active)) {
                throw ValidationException::withMessages([
                    'email' => ['Usuário inativo. Procure o setor de estágio.'],
                ]);
            }
        } else {
            $user = User::create([
                'name' => $googleUser->getName() ?? explode('@', $email)[0],
                'nome' => $googleUser->getName() ?? explode('@', $email)[0],
                'email' => $email,
                'role' => $role,
                'perfil' => strtoupper($role),
                'password' => bcrypt(Str::random(32)),
                'status' => 'ativo',
                'is_active' => true,
            ]);
        }

        $expiration = config('sanctum.expiration', 120);
        $expiresAt = now()->addMinutes($expiration);
        $token = $user->createToken('sage_google_oauth', ['*'], $expiresAt);

        return [
            'user' => $user,
            'token' => $token->plainTextToken,
            'token_type' => 'Bearer',
            'expires_at' => $expiresAt->toIso8601String(),
        ];
    }
}

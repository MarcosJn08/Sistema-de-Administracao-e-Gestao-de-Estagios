<?php

namespace App\Services;

use App\Jobs\EnviarEmailRecuperacaoSenhaJob;
use App\Models\User;
use Illuminate\Auth\Events\PasswordReset;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Password;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

class PasswordResetService
{
    public function solicitarLink(string $email): void
    {
        DB::transaction(function () use ($email): void {
            $usuario = User::query()->whereRaw('LOWER(email) = ?', [$email])->lockForUpdate()->first();

            Password::broker('users')->sendResetLink(
                ['email' => $usuario?->email ?? $email],
                function (User $usuario, string $token): void {
                    EnviarEmailRecuperacaoSenhaJob::dispatch($usuario, $token)->afterCommit();
                },
            );
        }, 3);
    }

    public function redefinir(array $dados): void
    {
        $status = DB::transaction(function () use ($dados): string {
            $usuario = User::query()->whereRaw('LOWER(email) = ?', [$dados['email']])->lockForUpdate()->first();
            $dados['email'] = $usuario?->email ?? $dados['email'];

            return Password::broker('users')->reset($dados, function (User $usuario, string $senha): void {
                $usuario->forceFill([
                    'password' => Hash::make($senha),
                    'remember_token' => Str::random(60),
                ])->save();

                DB::afterCommit(fn () => event(new PasswordReset($usuario)));
            });
        }, 3);

        if ($status !== Password::PASSWORD_RESET) {
            throw ValidationException::withMessages([
                'token' => 'O link de recuperação é inválido ou expirou. Solicite um novo link.',
            ]);
        }
    }
}

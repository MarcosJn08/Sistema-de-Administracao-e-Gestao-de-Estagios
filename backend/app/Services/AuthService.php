<?php

namespace App\Services;

use App\Models\User;
use Illuminate\Auth\AuthenticationException;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Str;

class AuthService
{
    public static function normalizeIdentifier(string $identifier): string
    {
        $identifier = Str::lower(trim($identifier));

        return str_contains($identifier, '@')
            ? $identifier
            : str_replace(['.', '/', '-'], '', $identifier);
    }

    public function login(string $identifier, #[\SensitiveParameter] string $password, bool $isLegacyEmailLogin = false): array
    {
        $identifier = self::normalizeIdentifier($identifier);
        $query = User::query();

        if (str_contains($identifier, '@')) {
            $query->whereRaw('LOWER(email) = ?', [$identifier]);
        } else {
            $query->where(function (Builder $query) use ($identifier): void {
                $query->where(fn (Builder $query) => $query->where('role', 'aluno')->where('matricula', $identifier))
                    ->orWhere(fn (Builder $query) => $query->whereIn('role', ['professor', 'diretor'])->where('siape', $identifier))
                    ->orWhere(fn (Builder $query) => $query->where('role', 'empresa')->where('cnpj', $identifier));
            });
        }

        $candidates = $query->limit(2)->get();
        $candidate = $candidates->count() === 1 ? $candidates->first() : null;

        if ($isLegacyEmailLogin) {
            if (! $candidate || $candidate->status !== 'ativo' || ! \Illuminate\Support\Facades\Hash::check($password, $candidate->password)) {
                throw \Illuminate\Validation\ValidationException::withMessages(['email' => ['Credenciais inválidas.']]);
            }
            $expiresAt = now()->addMinutes(config('sanctum.expiration', 120));
            $token = $candidate->createToken('sage', ['*'], $expiresAt);
            $plainToken = $token->plainTextToken;
            $candidate->_token_plain = $plainToken;

            return [
                'user' => $candidate,
                'token' => $plainToken,
                'expires_at' => $expiresAt->toIso8601String(),
            ];
        }

        $userId = $candidate?->canAuthenticate() ? $candidate->id : null;
        $guard = Auth::guard('web');

        if (! $guard->once(['id' => $userId, 'password' => $password])) {
            throw new AuthenticationException('Identificador ou senha inválidos.');
        }

        $user = $guard->user();
        $expiresAt = now()->addMinutes(config('sanctum.expiration'));
        $token = $user->createToken('sage', ['*'], $expiresAt);

        return [
            'user' => $user,
            'token' => $token->plainTextToken,
            'expires_at' => $expiresAt->toIso8601String(),
        ];
    }

    public function logout(Request $request): void
    {
        $request->user()->currentAccessToken()->delete();
    }
}

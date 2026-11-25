<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Auth\AuthenticationException;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureAccountIsActive
{
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        if ($user && ($user->status === 'inativo' || ! $user->is_active)) {
            $user->currentAccessToken()?->delete();

            if ($user->status === 'inativo') {
                abort(403, 'Usuário inativo.');
            }

            throw new AuthenticationException;
        }

        if (! $user?->canAuthenticate()) {
            $user?->currentAccessToken()?->delete();

            throw new AuthenticationException;
        }

        return $next($request);
    }
}

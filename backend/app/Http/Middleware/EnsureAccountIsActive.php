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
        if (! $request->user()?->canAuthenticate()) {
            $request->user()?->currentAccessToken()?->delete();

            throw new AuthenticationException;
        }

        return $next($request);
    }
}

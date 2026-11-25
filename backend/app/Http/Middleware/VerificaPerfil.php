<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;

class VerificaPerfil
{
    public function handle(Request $request, Closure $next, string ...$perfis)
    {
        $usuario = $request->user();

        if (! $usuario || ! $usuario->temPerfil(...$perfis)) {
            return response()->json(['message' => 'Sem permissão para esta ação.'], 403);
        }

        return $next($request);
    }
}
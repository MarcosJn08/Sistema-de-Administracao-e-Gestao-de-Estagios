<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;
use Symfony\Component\HttpFoundation\Response;

class RequestAudit
{
    public function handle(Request $request, Closure $next): Response
    {
        $id = (string) Str::uuid();
        $request->attributes->set('request_id', $id);
        $response = $next($request);
        $response->headers->set('X-Request-ID', $id);

        return $response;
    }

    public function terminate(Request $request, Response $response): void
    {
        if ($request->is('api/*') && ! $request->isMethod('GET') && ! $request->isMethod('OPTIONS')) {
            Log::info('api.mutation', ['request_id' => $request->attributes->get('request_id'), 'usuario_id' => $request->user()?->id,
                'method' => $request->method(), 'route' => $request->route()?->uri(), 'status' => $response->getStatusCode()]);
        }
    }
}

<?php

use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;

use App\Http\Middleware\ForceJsonResponse;

use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Auth\AuthenticationException;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Validation\ValidationException;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;

return Application::configure(basePath: dirname(__DIR__))

    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api.php',
        apiPrefix: 'api/v1',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware): void {
        $middleware->prepend(ForceJsonResponse::class);
    })

    ->withExceptions(function (Exceptions $exceptions): void {

    $exceptions->render(function (
        ValidationException $e,
        $request
    ) {
        if ($request->is('api/*')) {
            return response()->json([
                'success' => false,
                'message' => 'Os dados informados são inválidos.',
                'errors' => $e->errors(),
            ], 422);
        }
    });

    $exceptions->render(function (
        ModelNotFoundException $e,
        $request
    ) {
        if ($request->is('api/*')) {
            return response()->json([
                'success' => false,
                'message' => 'Registro não encontrado.',
                'errors' => [],
            ], 404);
        }
    });

    $exceptions->render(function (
        AuthenticationException $e,
        $request
    ) {
        if ($request->is('api/*')) {
            return response()->json([
                'success' => false,
                'message' => 'Não autenticado.',
                'errors' => [],
            ], 401);
        }
    });

    $exceptions->render(function (
        AuthorizationException $e,
        $request
    ) {
        if ($request->is('api/*')) {
            return response()->json([
                'success' => false,
                'message' => 'Você não tem permissão para realizar esta ação.',
                'errors' => [],
            ], 403);
        }
    });

    $exceptions->render(function (
        NotFoundHttpException $e,
        $request
    ) {
        if ($request->is('api/*')) {
            return response()->json([
                'success' => false,
                'message' => 'Rota ou recurso não encontrado.',
                'errors' => [],
            ], 404);
        }
    });

})

->create();


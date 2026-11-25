<?php

use App\Http\Middleware\ForceJsonResponse;
use App\Http\Middleware\RequestAudit;
use App\Http\Middleware\UsuarioAtivo;
use App\Http\Middleware\VerificaPerfil;
use Illuminate\Database\QueryException;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Http\Request;
use App\Http\Middleware\EnsureAccountIsActive;
use Illuminate\Validation\ValidationException;
use Symfony\Component\HttpKernel\Exception\HttpException;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;
use Symfony\Component\HttpFoundation\Response;

return Application::configure(basePath: dirname(__DIR__))

    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api.php',
        apiPrefix: 'api',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withRouting(web: __DIR__.'/../routes/web.php', api: __DIR__.'/../routes/api.php', apiPrefix: 'api/v1', commands: __DIR__.'/../routes/console.php', health: '/up')
    ->withMiddleware(function (Middleware $middleware): void {
        $middleware->prepend(ForceJsonResponse::class);
        $middleware->append(RequestAudit::class);
        $middleware->alias(['ativo' => UsuarioAtivo::class, 'perfil' => VerificaPerfil::class]);
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        $exceptions->render(function (ValidationException $e, Request $request) {
            if ($request->is('api/*')) {
                return response()->json(['success' => false, 'message' => 'Os dados informados são inválidos.', 'data' => null, 'errors' => $e->errors()], 422);
            }
        });
        $exceptions->render(function (QueryException $e, Request $request) {
            if ($request->is('api/*') && in_array((string) $e->getCode(), ['23000', '23505', '23503'], true)) {
                return response()->json(['success' => false, 'message' => 'A operação conflita com um registro existente ou vínculo obrigatório.', 'data' => null, 'errors' => []], 409);
            }
        });
        $exceptions->respond(function (Response $response, Throwable $e, Request $request): Response {
            if (! $request->is('api/*') || $response->getStatusCode() < 400 || $e instanceof ValidationException) {
                return $response;
            }
            $status = $response->getStatusCode();
            $message = match ($status) {
                401 => 'Não autenticado.', 403 => 'Você não tem permissão para realizar esta ação.',
                404 => 'Rota ou recurso não encontrado.', 405 => 'Método não permitido.',
                409 => 'A operação conflita com um registro existente ou vínculo obrigatório.',
                413 => 'Arquivo muito grande.', 429 => 'Muitas tentativas. Tente novamente mais tarde.',
                default => $status >= 500 ? 'Ocorreu um erro interno.' : 'Não foi possível realizar a operação.',
            };
            $headers = array_intersect_key($response->headers->all(), array_flip(['retry-after', 'x-ratelimit-limit', 'x-ratelimit-remaining']));

            return response()->json(['success' => false, 'message' => $message, 'data' => null, 'errors' => []], $status, $headers);
        });
    })->create();

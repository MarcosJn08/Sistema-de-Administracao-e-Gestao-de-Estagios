<?php

namespace App\Http\Docs\Auth;

use App\Http\Requests\LoginRequest;
use App\Http\Resources\UserResource;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use OpenApi\Attributes as OA;

trait AuthDocs
{
    #[OA\Post(
        path: '/api/auth/login',
        operationId: 'authLogin',
        summary: 'Autenticar uma conta',
        description: 'Valida as credenciais e emite um token independente. Limites: 5 requisições por identificador/IP e 30 por IP a cada minuto, incluindo logins bem-sucedidos. Não exige cookies, Origin, Referer ou CSRF. Não há refresh token: após expirar é necessário fazer login novamente.',
        security: [],
        tags: ['Autenticação'],
        requestBody: new OA\RequestBody(
            required: true,
            content: new OA\JsonContent(ref: '#/components/schemas/LoginRequest')
        ),
        responses: [
            new OA\Response(response: 200, description: 'Conta autenticada e token emitido.', content: new OA\JsonContent(ref: '#/components/schemas/LoginResponse')),
            new OA\Response(
                response: 401,
                description: 'Credenciais incorretas, conta inexistente, inativa, sem perfil ou com domínio incompatível. A resposta é idêntica para não revelar a existência da conta.',
                content: new OA\JsonContent(
                    ref: '#/components/schemas/ErrorResponse',
                    example: ['success' => false, 'message' => 'Identificador ou senha inválidos.', 'errors' => []]
                )
            ),
            new OA\Response(ref: '#/components/responses/ValidationError', response: 422),
            new OA\Response(ref: '#/components/responses/TooManyRequests', response: 429),
        ]
    )]
    abstract public function login(LoginRequest $request): UserResource;

    #[OA\Get(
        path: '/api/auth/me',
        operationId: 'authMe',
        summary: 'Consultar a conta autenticada',
        description: 'Retorna somente dados públicos da própria conta e o identificador pertinente ao perfil. Uma conta desativada ou incompatível com as regras institucionais tem o token atual revogado e recebe 401.',
        security: [['bearerAuth' => []]],
        tags: ['Autenticação'],
        responses: [
            new OA\Response(response: 200, description: 'Dados públicos da conta autenticada.', content: new OA\JsonContent(ref: '#/components/schemas/AuthenticatedUserResponse')),
            new OA\Response(ref: '#/components/responses/Unauthorized', response: 401),
        ]
    )]
    abstract public function me(Request $request): UserResource;

    #[OA\Post(
        path: '/api/auth/logout',
        operationId: 'authLogout',
        summary: 'Revogar o token atual',
        description: 'Revoga apenas o token enviado nesta requisição. Os demais tokens da conta permanecem válidos até revogação ou expiração.',
        security: [['bearerAuth' => []]],
        tags: ['Autenticação'],
        responses: [
            new OA\Response(response: 204, description: 'Token atual revogado. Resposta sem corpo.'),
            new OA\Response(ref: '#/components/responses/Unauthorized', response: 401),
        ]
    )]
    abstract public function logout(Request $request): Response;
}

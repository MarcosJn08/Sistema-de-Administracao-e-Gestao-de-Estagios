<?php

namespace App\Http\Docs\Endpoints;

use OpenApi\Attributes as OA;

#[OA\Get(
    path: '/api/auth/google/callback',
    summary: 'Concluir autenticação com Google',
    tags: ['Autenticação'],
    parameters: [
        new OA\Parameter(name: 'code', in: 'query', schema: new OA\Schema(type: 'string')),
        new OA\Parameter(name: 'token', in: 'query', schema: new OA\Schema(type: 'string')),
        new OA\Parameter(name: 'access_token', in: 'query', schema: new OA\Schema(type: 'string')),
    ],
    requestBody: new OA\RequestBody(
        required: false,
        content: new OA\JsonContent(type: 'object',
            properties: [
                new OA\Property(property: 'code', type: 'string'),
                new OA\Property(property: 'token', type: 'string'),
                new OA\Property(property: 'access_token', type: 'string'),
            ],
        ),
    ),
    responses: [
        new OA\Response(response: 200, description: 'Operação realizada com sucesso.'),
        new OA\Response(response: 302, description: 'Redirecionamento do fluxo Google.'),
        new OA\Response(response: 404, description: 'Recurso não encontrado.'),
        new OA\Response(response: 422, description: 'Dados inválidos ou regra de negócio não atendida.'),
    ],
)]

#[OA\Post(
    path: '/api/auth/google/callback',
    summary: 'Concluir autenticação com Google',
    tags: ['Autenticação'],
    requestBody: new OA\RequestBody(
        required: false,
        content: new OA\JsonContent(type: 'object',
            properties: [
                new OA\Property(property: 'code', type: 'string'),
                new OA\Property(property: 'token', type: 'string'),
                new OA\Property(property: 'access_token', type: 'string'),
            ],
        ),
    ),
    responses: [
        new OA\Response(response: 200, description: 'Operação realizada com sucesso.'),
        new OA\Response(response: 302, description: 'Redirecionamento do fluxo Google.'),
        new OA\Response(response: 422, description: 'Dados inválidos ou regra de negócio não atendida.'),
    ],
)]

#[OA\Get(
    path: '/api/auth/google/redirect',
    summary: 'Iniciar autenticação com Google',
    tags: ['Autenticação'],
    responses: [
        new OA\Response(response: 200, description: 'Operação realizada com sucesso.'),
        new OA\Response(response: 302, description: 'Redirecionamento do fluxo Google.'),
        new OA\Response(response: 422, description: 'Dados inválidos ou regra de negócio não atendida.'),
    ],
)]
final class GoogleAuthDocs {}

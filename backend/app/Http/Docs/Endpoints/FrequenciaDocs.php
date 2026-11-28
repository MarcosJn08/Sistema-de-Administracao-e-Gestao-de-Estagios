<?php

namespace App\Http\Docs\Endpoints;

use OpenApi\Attributes as OA;

#[OA\Get(
    path: '/api/estagios/{estagio}/frequencias',
    summary: 'Listar — Frequências',
    tags: ['Frequências'],
    security: [['bearerAuth' => []]],
    parameters: [
        new OA\Parameter(name: 'estagio', in: 'path', required: true, schema: new OA\Schema(type: 'integer', minimum: 1)),
        new OA\Parameter(name: 'per_page', in: 'query', schema: new OA\Schema(type: 'integer')),
        new OA\Parameter(name: 'page', in: 'query', schema: new OA\Schema(type: 'integer')),
    ],
    responses: [
        new OA\Response(response: 200, description: 'Operação realizada com sucesso.'),
        new OA\Response(response: 401, description: 'Token ausente ou inválido.'),
        new OA\Response(response: 403, description: 'Acesso não permitido.'),
        new OA\Response(response: 404, description: 'Recurso não encontrado.'),
        new OA\Response(response: 422, description: 'Dados inválidos ou regra de negócio não atendida.'),
    ],
)]

#[OA\Post(
    path: '/api/estagios/{estagio}/frequencias',
    summary: 'Cadastrar — Frequências',
    tags: ['Frequências'],
    security: [['bearerAuth' => []]],
    parameters: [
        new OA\Parameter(name: 'estagio', in: 'path', required: true, schema: new OA\Schema(type: 'integer', minimum: 1)),
    ],
    requestBody: new OA\RequestBody(
        required: true,
        content: new OA\JsonContent(type: 'object', required: ['data', 'hora_entrada', 'hora_saida'],
            properties: [
                new OA\Property(property: 'data', type: 'string', format: 'date'),
                new OA\Property(property: 'hora_entrada', type: 'string'),
                new OA\Property(property: 'hora_saida', type: 'string'),
            ],
        ),
    ),
    responses: [
        new OA\Response(response: 201, description: 'Operação realizada com sucesso.'),
        new OA\Response(response: 401, description: 'Token ausente ou inválido.'),
        new OA\Response(response: 403, description: 'Acesso não permitido.'),
        new OA\Response(response: 404, description: 'Recurso não encontrado.'),
        new OA\Response(response: 422, description: 'Dados inválidos ou regra de negócio não atendida.'),
    ],
)]

#[OA\Put(
    path: '/api/estagios/{estagio}/frequencias/{frequencia}',
    summary: 'Atualizar — Frequências',
    tags: ['Frequências'],
    security: [['bearerAuth' => []]],
    parameters: [
        new OA\Parameter(name: 'estagio', in: 'path', required: true, schema: new OA\Schema(type: 'integer', minimum: 1)),
        new OA\Parameter(name: 'frequencia', in: 'path', required: true, schema: new OA\Schema(type: 'integer', minimum: 1)),
    ],
    requestBody: new OA\RequestBody(
        required: true,
        content: new OA\JsonContent(type: 'object', required: ['data', 'hora_entrada', 'hora_saida'],
            properties: [
                new OA\Property(property: 'data', type: 'string', format: 'date'),
                new OA\Property(property: 'hora_entrada', type: 'string'),
                new OA\Property(property: 'hora_saida', type: 'string'),
            ],
        ),
    ),
    responses: [
        new OA\Response(response: 200, description: 'Operação realizada com sucesso.'),
        new OA\Response(response: 401, description: 'Token ausente ou inválido.'),
        new OA\Response(response: 403, description: 'Acesso não permitido.'),
        new OA\Response(response: 404, description: 'Recurso não encontrado.'),
        new OA\Response(response: 422, description: 'Dados inválidos ou regra de negócio não atendida.'),
    ],
)]

#[OA\Post(
    path: '/api/estagios/{estagio}/frequencias/{frequencia}/assinatura',
    summary: 'Assinar frequência diária',
    tags: ['Frequências'],
    security: [['bearerAuth' => []]],
    parameters: [
        new OA\Parameter(name: 'estagio', in: 'path', required: true, schema: new OA\Schema(type: 'integer', minimum: 1)),
        new OA\Parameter(name: 'frequencia', in: 'path', required: true, schema: new OA\Schema(type: 'integer', minimum: 1)),
    ],
    responses: [
        new OA\Response(response: 200, description: 'Operação realizada com sucesso.'),
        new OA\Response(response: 401, description: 'Token ausente ou inválido.'),
        new OA\Response(response: 403, description: 'Acesso não permitido.'),
        new OA\Response(response: 404, description: 'Recurso não encontrado.'),
        new OA\Response(response: 422, description: 'Dados inválidos ou regra de negócio não atendida.'),
    ],
)]
final class FrequenciaDocs {}

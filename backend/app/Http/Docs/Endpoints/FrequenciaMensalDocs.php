<?php

namespace App\Http\Docs\Endpoints;

use OpenApi\Attributes as OA;

#[OA\Get(
    path: '/api/estagios/{estagio}/frequencias-mensais',
    summary: 'Listar — Frequências mensais',
    tags: ['Frequências mensais'],
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
    path: '/api/estagios/{estagio}/frequencias-mensais',
    summary: 'Cadastrar — Frequências mensais',
    tags: ['Frequências mensais'],
    security: [['bearerAuth' => []]],
    parameters: [
        new OA\Parameter(name: 'estagio', in: 'path', required: true, schema: new OA\Schema(type: 'integer', minimum: 1)),
    ],
    requestBody: new OA\RequestBody(
        required: true,
        content: new OA\MediaType(mediaType: 'multipart/form-data', schema: new OA\Schema(type: 'object', required: ['mes_competencia', 'ano_competencia', 'total_horas_mes', 'arquivo'],
            properties: [
                new OA\Property(property: 'mes_competencia', type: 'integer'),
                new OA\Property(property: 'ano_competencia', type: 'integer'),
                new OA\Property(property: 'total_horas_mes', type: 'number'),
                new OA\Property(property: 'arquivo', type: 'string', format: 'binary'),
            ],
        )),
    ),
    responses: [
        new OA\Response(response: 201, description: 'Operação realizada com sucesso.'),
        new OA\Response(response: 401, description: 'Token ausente ou inválido.'),
        new OA\Response(response: 403, description: 'Acesso não permitido.'),
        new OA\Response(response: 404, description: 'Recurso não encontrado.'),
        new OA\Response(response: 422, description: 'Dados inválidos ou regra de negócio não atendida.'),
    ],
)]

#[OA\Post(
    path: '/api/frequencias-mensais/{frequenciaMensal}/aprovar',
    summary: 'Aprovar frequência mensal',
    tags: ['Frequências mensais'],
    security: [['bearerAuth' => []]],
    parameters: [
        new OA\Parameter(name: 'frequenciaMensal', in: 'path', required: true, schema: new OA\Schema(type: 'integer', minimum: 1)),
    ],
    responses: [
        new OA\Response(response: 200, description: 'Operação realizada com sucesso.'),
        new OA\Response(response: 401, description: 'Token ausente ou inválido.'),
        new OA\Response(response: 403, description: 'Acesso não permitido.'),
        new OA\Response(response: 404, description: 'Recurso não encontrado.'),
        new OA\Response(response: 422, description: 'Dados inválidos ou regra de negócio não atendida.'),
    ],
)]
final class FrequenciaMensalDocs {}

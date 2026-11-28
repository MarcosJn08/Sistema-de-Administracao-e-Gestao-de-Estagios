<?php

namespace App\Http\Docs\Endpoints;

use OpenApi\Attributes as OA;

#[OA\Post(
    path: '/api/supervisao-campo/frequencia-diaria',
    summary: 'Registrar frequência de campo em lote',
    tags: ['Supervisão de campo'],
    description: 'O corpo contém data (AAAA-MM-DD) e registros. Cada registro informa aluno_id, estagio_id, presente, horas_cumpridas (0 a 12) e observacoes opcionais.',
    security: [['bearerAuth' => []]],
    requestBody: new OA\RequestBody(
        required: true,
        content: new OA\JsonContent(type: 'object', required: ['data', 'registros'],
            properties: [
                new OA\Property(property: 'data', type: 'string', format: 'date'),
                new OA\Property(property: 'registros', type: 'array', items: new OA\Items(type: 'object')),
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

#[OA\Get(
    path: '/api/supervisao-campo/historico-aluno/{alunoId}',
    summary: 'Consultar histórico de frequência do aluno',
    tags: ['Supervisão de campo'],
    security: [['bearerAuth' => []]],
    parameters: [
        new OA\Parameter(name: 'alunoId', in: 'path', required: true, schema: new OA\Schema(type: 'integer', minimum: 1)),
    ],
    responses: [
        new OA\Response(response: 200, description: 'Operação realizada com sucesso.'),
        new OA\Response(response: 401, description: 'Token ausente ou inválido.'),
        new OA\Response(response: 403, description: 'Acesso não permitido.'),
        new OA\Response(response: 404, description: 'Recurso não encontrado.'),
        new OA\Response(response: 422, description: 'Dados inválidos ou regra de negócio não atendida.'),
    ],
)]

#[OA\Get(
    path: '/api/supervisao-campo/turmas',
    summary: 'Consultar turmas da supervisão de campo',
    tags: ['Supervisão de campo'],
    security: [['bearerAuth' => []]],
    responses: [
        new OA\Response(response: 200, description: 'Operação realizada com sucesso.'),
        new OA\Response(response: 401, description: 'Token ausente ou inválido.'),
        new OA\Response(response: 403, description: 'Acesso não permitido.'),
        new OA\Response(response: 404, description: 'Recurso não encontrado.'),
        new OA\Response(response: 422, description: 'Dados inválidos ou regra de negócio não atendida.'),
    ],
)]
final class FrequenciaCampoDocs {}

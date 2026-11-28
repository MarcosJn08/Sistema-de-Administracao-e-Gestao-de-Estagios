<?php

namespace App\Http\Docs\Endpoints;

use OpenApi\Attributes as OA;

#[OA\Get(
    path: '/api/cursos',
    summary: 'Listar — Cursos',
    tags: ['Cursos'],
    parameters: [
        new OA\Parameter(name: 'per_page', in: 'query', schema: new OA\Schema(type: 'integer')),
        new OA\Parameter(name: 'page', in: 'query', schema: new OA\Schema(type: 'integer')),
    ],
    responses: [
        new OA\Response(response: 200, description: 'Operação realizada com sucesso.'),
        new OA\Response(response: 404, description: 'Recurso não encontrado.'),
    ],
)]

#[OA\Post(
    path: '/api/cursos',
    summary: 'Cadastrar — Cursos',
    tags: ['Cursos'],
    security: [['bearerAuth' => []]],
    requestBody: new OA\RequestBody(
        required: true,
        content: new OA\JsonContent(type: 'object',
            properties: [
                new OA\Property(property: 'nome', type: 'string'),
                new OA\Property(property: 'codigo', type: 'string'),
                new OA\Property(property: 'modalidade', type: 'string'),
                new OA\Property(property: 'carga_horaria_estagio', type: 'integer'),
                new OA\Property(property: 'horas_minimas_estagio', type: 'integer'),
                new OA\Property(property: 'permite_aproveitamento_projetos', type: 'boolean'),
                new OA\Property(property: 'modalidade_estagio', type: 'string'),
                new OA\Property(property: 'status', type: 'string'),
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
    path: '/api/cursos/{curso}',
    summary: 'Consultar — Cursos',
    tags: ['Cursos'],
    parameters: [
        new OA\Parameter(name: 'curso', in: 'path', required: true, schema: new OA\Schema(type: 'integer', minimum: 1)),
    ],
    responses: [
        new OA\Response(response: 200, description: 'Operação realizada com sucesso.'),
        new OA\Response(response: 404, description: 'Recurso não encontrado.'),
    ],
)]

#[OA\Put(
    path: '/api/cursos/{curso}',
    summary: 'Atualizar — Cursos',
    tags: ['Cursos'],
    security: [['bearerAuth' => []]],
    parameters: [
        new OA\Parameter(name: 'curso', in: 'path', required: true, schema: new OA\Schema(type: 'integer', minimum: 1)),
    ],
    requestBody: new OA\RequestBody(
        required: true,
        content: new OA\JsonContent(type: 'object',
            properties: [
                new OA\Property(property: 'nome', type: 'string'),
                new OA\Property(property: 'codigo', type: 'string'),
                new OA\Property(property: 'modalidade', type: 'string'),
                new OA\Property(property: 'carga_horaria_estagio', type: 'integer'),
                new OA\Property(property: 'horas_minimas_estagio', type: 'integer'),
                new OA\Property(property: 'permite_aproveitamento_projetos', type: 'boolean'),
                new OA\Property(property: 'modalidade_estagio', type: 'string'),
                new OA\Property(property: 'status', type: 'string'),
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

#[OA\Delete(
    path: '/api/cursos/{curso}',
    summary: 'Excluir — Cursos',
    tags: ['Cursos'],
    security: [['bearerAuth' => []]],
    parameters: [
        new OA\Parameter(name: 'curso', in: 'path', required: true, schema: new OA\Schema(type: 'integer', minimum: 1)),
    ],
    responses: [
        new OA\Response(response: 200, description: 'Operação realizada com sucesso.'),
        new OA\Response(response: 401, description: 'Token ausente ou inválido.'),
        new OA\Response(response: 403, description: 'Acesso não permitido.'),
        new OA\Response(response: 404, description: 'Recurso não encontrado.'),
        new OA\Response(response: 422, description: 'Dados inválidos ou regra de negócio não atendida.'),
    ],
)]
final class CursoDocs {}

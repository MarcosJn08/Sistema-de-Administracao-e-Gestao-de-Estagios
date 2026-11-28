<?php

namespace App\Http\Docs\Endpoints;

use OpenApi\Attributes as OA;

#[OA\Get(
    path: '/api/estagios',
    summary: 'Listar — Estágios',
    tags: ['Estágios'],
    security: [['bearerAuth' => []]],
    parameters: [
        new OA\Parameter(name: 'per_page', in: 'query', schema: new OA\Schema(type: 'integer')),
        new OA\Parameter(name: 'page', in: 'query', schema: new OA\Schema(type: 'integer')),
        new OA\Parameter(name: 'status', in: 'query', schema: new OA\Schema(type: 'string')),
        new OA\Parameter(name: 'curso_id', in: 'query', schema: new OA\Schema(type: 'integer')),
        new OA\Parameter(name: 'empresa_concedente_id', in: 'query', schema: new OA\Schema(type: 'integer')),
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
    path: '/api/estagios',
    summary: 'Cadastrar — Estágios',
    tags: ['Estágios'],
    security: [['bearerAuth' => []]],
    requestBody: new OA\RequestBody(
        required: true,
        content: new OA\MediaType(mediaType: 'multipart/form-data', schema: new OA\Schema(type: 'object', required: ['aluno_id', 'empresa_concedente_id', 'supervisor_empresa_id', 'cargo', 'data_inicio', 'data_termino', 'carga_horaria_diaria', 'carga_horaria_semanal', 'meta_horas_tce', 'modalidade', 'termo_formalizado'],
            properties: [
                new OA\Property(property: 'aluno_id', type: 'integer'),
                new OA\Property(property: 'empresa_concedente_id', type: 'integer'),
                new OA\Property(property: 'supervisor_empresa_id', type: 'integer'),
                new OA\Property(property: 'professor_orientador_id', type: 'integer'),
                new OA\Property(property: 'cargo', type: 'string'),
                new OA\Property(property: 'data_inicio', type: 'string', format: 'date'),
                new OA\Property(property: 'data_termino', type: 'string', format: 'date'),
                new OA\Property(property: 'carga_horaria_diaria', type: 'number'),
                new OA\Property(property: 'carga_horaria_semanal', type: 'number'),
                new OA\Property(property: 'meta_horas_tce', type: 'number'),
                new OA\Property(property: 'bolsa_auxilio', type: 'number'),
                new OA\Property(property: 'modalidade', type: 'string'),
                new OA\Property(property: 'termo_formalizado', type: 'string', format: 'binary'),
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

#[OA\Get(
    path: '/api/estagios/{estagio}',
    summary: 'Consultar — Estágios',
    tags: ['Estágios'],
    security: [['bearerAuth' => []]],
    parameters: [
        new OA\Parameter(name: 'estagio', in: 'path', required: true, schema: new OA\Schema(type: 'integer', minimum: 1)),
    ],
    responses: [
        new OA\Response(response: 200, description: 'Operação realizada com sucesso.'),
        new OA\Response(response: 401, description: 'Token ausente ou inválido.'),
        new OA\Response(response: 403, description: 'Acesso não permitido.'),
        new OA\Response(response: 404, description: 'Recurso não encontrado.'),
        new OA\Response(response: 422, description: 'Dados inválidos ou regra de negócio não atendida.'),
    ],
)]

#[OA\Put(
    path: '/api/estagios/{estagio}',
    summary: 'Atualizar — Estágios',
    tags: ['Estágios'],
    security: [['bearerAuth' => []]],
    parameters: [
        new OA\Parameter(name: 'estagio', in: 'path', required: true, schema: new OA\Schema(type: 'integer', minimum: 1)),
    ],
    requestBody: new OA\RequestBody(
        required: true,
        content: new OA\JsonContent(type: 'object',
            properties: [
                new OA\Property(property: 'cargo', type: 'string'),
                new OA\Property(property: 'data_inicio', type: 'string', format: 'date'),
                new OA\Property(property: 'data_termino', type: 'string', format: 'date'),
                new OA\Property(property: 'carga_horaria_diaria', type: 'number'),
                new OA\Property(property: 'carga_horaria_semanal', type: 'number'),
                new OA\Property(property: 'meta_horas_tce', type: 'number'),
                new OA\Property(property: 'bolsa_auxilio', type: 'number'),
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

#[OA\Patch(
    path: '/api/estagios/{estagio}',
    summary: 'Atualizar — Estágios',
    tags: ['Estágios'],
    security: [['bearerAuth' => []]],
    parameters: [
        new OA\Parameter(name: 'estagio', in: 'path', required: true, schema: new OA\Schema(type: 'integer', minimum: 1)),
    ],
    requestBody: new OA\RequestBody(
        required: true,
        content: new OA\JsonContent(type: 'object',
            properties: [
                new OA\Property(property: 'cargo', type: 'string'),
                new OA\Property(property: 'data_inicio', type: 'string', format: 'date'),
                new OA\Property(property: 'data_termino', type: 'string', format: 'date'),
                new OA\Property(property: 'carga_horaria_diaria', type: 'number'),
                new OA\Property(property: 'carga_horaria_semanal', type: 'number'),
                new OA\Property(property: 'meta_horas_tce', type: 'number'),
                new OA\Property(property: 'bolsa_auxilio', type: 'number'),
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
final class ContratoEstagioDocs {}

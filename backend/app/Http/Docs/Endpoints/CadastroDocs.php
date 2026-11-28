<?php

namespace App\Http\Docs\Endpoints;

use OpenApi\Attributes as OA;

#[OA\Get(
    path: '/api/{recurso}',
    summary: 'Listar — Cadastros institucionais',
    tags: ['Cadastros institucionais'],
    security: [['bearerAuth' => []]],
    parameters: [
        new OA\Parameter(name: 'recurso', in: 'path', required: true, schema: new OA\Schema(type: 'string', enum: ['turmas', 'alunos', 'empresas', 'professores', 'supervisores'])),
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
    path: '/api/{recurso}',
    summary: 'Cadastrar — Cadastros institucionais',
    tags: ['Cadastros institucionais'],
    description: 'Acesso da Direção. Os campos de cadastro variam conforme o recurso.',
    security: [['bearerAuth' => []]],
    parameters: [
        new OA\Parameter(name: 'recurso', in: 'path', required: true, schema: new OA\Schema(type: 'string', enum: ['turmas', 'alunos', 'empresas', 'professores', 'supervisores'])),
    ],
    requestBody: new OA\RequestBody(
        required: true,
        content: new OA\JsonContent(type: 'object',
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
    path: '/api/{recurso}/{id}',
    summary: 'Consultar — Cadastros institucionais',
    tags: ['Cadastros institucionais'],
    security: [['bearerAuth' => []]],
    parameters: [
        new OA\Parameter(name: 'recurso', in: 'path', required: true, schema: new OA\Schema(type: 'string', enum: ['turmas', 'alunos', 'empresas', 'professores', 'supervisores'])),
        new OA\Parameter(name: 'id', in: 'path', required: true, schema: new OA\Schema(type: 'integer', minimum: 1)),
    ],
    responses: [
        new OA\Response(response: 200, description: 'Operação realizada com sucesso.'),
        new OA\Response(response: 401, description: 'Token ausente ou inválido.'),
        new OA\Response(response: 403, description: 'Acesso não permitido.'),
        new OA\Response(response: 404, description: 'Recurso não encontrado.'),
        new OA\Response(response: 422, description: 'Dados inválidos ou regra de negócio não atendida.'),
    ],
)]

#[OA\Patch(
    path: '/api/{recurso}/{id}',
    summary: 'Atualizar — Cadastros institucionais',
    tags: ['Cadastros institucionais'],
    description: 'Acesso da Direção. Alteração parcial. Vínculos existentes são protegidos.',
    security: [['bearerAuth' => []]],
    parameters: [
        new OA\Parameter(name: 'recurso', in: 'path', required: true, schema: new OA\Schema(type: 'string', enum: ['turmas', 'alunos', 'empresas', 'professores', 'supervisores'])),
        new OA\Parameter(name: 'id', in: 'path', required: true, schema: new OA\Schema(type: 'integer', minimum: 1)),
    ],
    requestBody: new OA\RequestBody(
        required: true,
        content: new OA\JsonContent(type: 'object',
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
final class CadastroDocs {}

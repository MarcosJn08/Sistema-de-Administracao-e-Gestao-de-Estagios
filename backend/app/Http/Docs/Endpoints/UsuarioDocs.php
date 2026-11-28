<?php

namespace App\Http\Docs\Endpoints;

use OpenApi\Attributes as OA;

#[OA\Get(
    path: '/api/usuarios',
    summary: 'Listar — Usuários',
    tags: ['Usuários'],
    security: [['bearerAuth' => []]],
    parameters: [
        new OA\Parameter(name: 'per_page', in: 'query', schema: new OA\Schema(type: 'integer')),
        new OA\Parameter(name: 'page', in: 'query', schema: new OA\Schema(type: 'integer')),
        new OA\Parameter(name: 'perfil', in: 'query', schema: new OA\Schema(type: 'string')),
        new OA\Parameter(name: 'status', in: 'query', schema: new OA\Schema(type: 'string')),
        new OA\Parameter(name: 'curso', in: 'query', schema: new OA\Schema(type: 'string')),
        new OA\Parameter(name: 'busca', in: 'query', schema: new OA\Schema(type: 'string')),
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
    path: '/api/usuarios',
    summary: 'Cadastrar — Usuários',
    tags: ['Usuários'],
    security: [['bearerAuth' => []]],
    requestBody: new OA\RequestBody(
        required: true,
        content: new OA\JsonContent(type: 'object', required: ['nome', 'email', 'password', 'perfil'],
            properties: [
                new OA\Property(property: 'nome', type: 'string'),
                new OA\Property(property: 'email', type: 'string', format: 'email'),
                new OA\Property(property: 'password', type: 'string'),
                new OA\Property(property: 'perfil', type: 'string'),
                new OA\Property(property: 'cpf', type: 'string'),
                new OA\Property(property: 'matricula', type: 'string'),
                new OA\Property(property: 'siape', type: 'string'),
                new OA\Property(property: 'cnpj', type: 'string'),
                new OA\Property(property: 'curso', type: 'string'),
                new OA\Property(property: 'telefone', type: 'string'),
                new OA\Property(property: 'dataNascimento', type: 'string', format: 'date'),
                new OA\Property(property: 'semestre', type: 'integer'),
                new OA\Property(property: 'periodoAno', type: 'string'),
                new OA\Property(property: 'turno', type: 'string'),
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
    path: '/api/usuarios/{usuario}',
    summary: 'Consultar — Usuários',
    tags: ['Usuários'],
    security: [['bearerAuth' => []]],
    parameters: [
        new OA\Parameter(name: 'usuario', in: 'path', required: true, schema: new OA\Schema(type: 'integer', minimum: 1)),
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
    path: '/api/usuarios/{usuario}',
    summary: 'Atualizar — Usuários',
    tags: ['Usuários'],
    security: [['bearerAuth' => []]],
    parameters: [
        new OA\Parameter(name: 'usuario', in: 'path', required: true, schema: new OA\Schema(type: 'integer', minimum: 1)),
    ],
    requestBody: new OA\RequestBody(
        required: true,
        content: new OA\JsonContent(type: 'object',
            properties: [
                new OA\Property(property: 'nome', type: 'string'),
                new OA\Property(property: 'email', type: 'string', format: 'email'),
                new OA\Property(property: 'password', type: 'string'),
                new OA\Property(property: 'perfil', type: 'string'),
                new OA\Property(property: 'cpf', type: 'string'),
                new OA\Property(property: 'matricula', type: 'string'),
                new OA\Property(property: 'siape', type: 'string'),
                new OA\Property(property: 'cnpj', type: 'string'),
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

#[OA\Patch(
    path: '/api/usuarios/{usuario}',
    summary: 'Atualizar — Usuários',
    tags: ['Usuários'],
    security: [['bearerAuth' => []]],
    parameters: [
        new OA\Parameter(name: 'usuario', in: 'path', required: true, schema: new OA\Schema(type: 'integer', minimum: 1)),
    ],
    requestBody: new OA\RequestBody(
        required: true,
        content: new OA\JsonContent(type: 'object',
            properties: [
                new OA\Property(property: 'nome', type: 'string'),
                new OA\Property(property: 'email', type: 'string', format: 'email'),
                new OA\Property(property: 'password', type: 'string'),
                new OA\Property(property: 'perfil', type: 'string'),
                new OA\Property(property: 'cpf', type: 'string'),
                new OA\Property(property: 'matricula', type: 'string'),
                new OA\Property(property: 'siape', type: 'string'),
                new OA\Property(property: 'cnpj', type: 'string'),
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
    path: '/api/usuarios/{usuario}',
    summary: 'Excluir — Usuários',
    tags: ['Usuários'],
    security: [['bearerAuth' => []]],
    parameters: [
        new OA\Parameter(name: 'usuario', in: 'path', required: true, schema: new OA\Schema(type: 'integer', minimum: 1)),
    ],
    responses: [
        new OA\Response(response: 200, description: 'Operação realizada com sucesso.'),
        new OA\Response(response: 401, description: 'Token ausente ou inválido.'),
        new OA\Response(response: 403, description: 'Acesso não permitido.'),
        new OA\Response(response: 404, description: 'Recurso não encontrado.'),
        new OA\Response(response: 422, description: 'Dados inválidos ou regra de negócio não atendida.'),
    ],
)]
final class UsuarioDocs {}

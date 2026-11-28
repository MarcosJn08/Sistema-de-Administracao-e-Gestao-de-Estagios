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
        content: new OA\JsonContent(oneOf: [
            new OA\Schema(title: 'turmas', type: 'object', additionalProperties: false, required: ['curso_id', 'nome', 'ano', 'semestre'],
                properties: [
                    new OA\Property(property: 'curso_id', type: 'integer'),
                    new OA\Property(property: 'nome', type: 'string'),
                    new OA\Property(property: 'ano', type: 'integer'),
                    new OA\Property(property: 'semestre', type: 'integer'),
                    new OA\Property(property: 'turno', type: 'string'),
                    new OA\Property(property: 'status', type: 'string'),
                ],
            ),
            new OA\Schema(title: 'alunos', type: 'object', additionalProperties: false, required: ['usuario_id', 'turma_id', 'matricula', 'cpf'],
                properties: [
                    new OA\Property(property: 'usuario_id', type: 'integer'),
                    new OA\Property(property: 'turma_id', type: 'integer'),
                    new OA\Property(property: 'matricula', type: 'string'),
                    new OA\Property(property: 'cpf', type: 'string'),
                ],
            ),
            new OA\Schema(title: 'empresas', type: 'object', additionalProperties: false, required: ['cnpj', 'razao_social', 'endereco_completo', 'representante_legal'],
                properties: [
                    new OA\Property(property: 'cnpj', type: 'string'),
                    new OA\Property(property: 'razao_social', type: 'string'),
                    new OA\Property(property: 'endereco_completo', type: 'string'),
                    new OA\Property(property: 'representante_legal', type: 'string'),
                    new OA\Property(property: 'status_convenio', type: 'string'),
                    new OA\Property(property: 'cidade', type: 'string'),
                    new OA\Property(property: 'uf', type: 'string'),
                    new OA\Property(property: 'cep', type: 'string'),
                    new OA\Property(property: 'telefone', type: 'string'),
                    new OA\Property(property: 'fax', type: 'string'),
                    new OA\Property(property: 'email', type: 'string', format: 'email'),
                    new OA\Property(property: 'cargo_representante', type: 'string'),
                    new OA\Property(property: 'numero', type: 'string'),
                    new OA\Property(property: 'bairro', type: 'string'),
                    new OA\Property(property: 'numero_registro', type: 'string'),
                    new OA\Property(property: 'conselho_fiscalizacao', type: 'string'),
                ],
            ),
            new OA\Schema(title: 'professores', type: 'object', additionalProperties: false, required: ['usuario_id', 'siape_matricula', 'departamento_area', 'max_orientados'],
                properties: [
                    new OA\Property(property: 'usuario_id', type: 'integer'),
                    new OA\Property(property: 'siape_matricula', type: 'string'),
                    new OA\Property(property: 'departamento_area', type: 'string'),
                    new OA\Property(property: 'max_orientados', type: 'integer'),
                ],
            ),
            new OA\Schema(title: 'supervisores', type: 'object', additionalProperties: false, required: ['empresa_concedente_id', 'nome', 'cargo', 'formacao', 'telefone', 'email'],
                properties: [
                    new OA\Property(property: 'empresa_concedente_id', type: 'integer'),
                    new OA\Property(property: 'usuario_id', type: 'integer'),
                    new OA\Property(property: 'nome', type: 'string'),
                    new OA\Property(property: 'cargo', type: 'string'),
                    new OA\Property(property: 'formacao', type: 'string'),
                    new OA\Property(property: 'telefone', type: 'string'),
                    new OA\Property(property: 'email', type: 'string', format: 'email'),
                ],
            ),
        ]),
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
        content: new OA\JsonContent(anyOf: [
            new OA\Schema(title: 'turmas', type: 'object', additionalProperties: false,
                properties: [
                    new OA\Property(property: 'curso_id', type: 'integer'),
                    new OA\Property(property: 'nome', type: 'string'),
                    new OA\Property(property: 'ano', type: 'integer'),
                    new OA\Property(property: 'semestre', type: 'integer'),
                    new OA\Property(property: 'turno', type: 'string'),
                    new OA\Property(property: 'status', type: 'string'),
                ],
            ),
            new OA\Schema(title: 'alunos', type: 'object', additionalProperties: false,
                properties: [
                    new OA\Property(property: 'usuario_id', type: 'integer'),
                    new OA\Property(property: 'turma_id', type: 'integer'),
                    new OA\Property(property: 'matricula', type: 'string'),
                    new OA\Property(property: 'cpf', type: 'string'),
                ],
            ),
            new OA\Schema(title: 'empresas', type: 'object', additionalProperties: false,
                properties: [
                    new OA\Property(property: 'cnpj', type: 'string'),
                    new OA\Property(property: 'razao_social', type: 'string'),
                    new OA\Property(property: 'endereco_completo', type: 'string'),
                    new OA\Property(property: 'representante_legal', type: 'string'),
                    new OA\Property(property: 'status_convenio', type: 'string'),
                    new OA\Property(property: 'cidade', type: 'string'),
                    new OA\Property(property: 'uf', type: 'string'),
                    new OA\Property(property: 'cep', type: 'string'),
                    new OA\Property(property: 'telefone', type: 'string'),
                    new OA\Property(property: 'fax', type: 'string'),
                    new OA\Property(property: 'email', type: 'string', format: 'email'),
                    new OA\Property(property: 'cargo_representante', type: 'string'),
                    new OA\Property(property: 'numero', type: 'string'),
                    new OA\Property(property: 'bairro', type: 'string'),
                    new OA\Property(property: 'numero_registro', type: 'string'),
                    new OA\Property(property: 'conselho_fiscalizacao', type: 'string'),
                ],
            ),
            new OA\Schema(title: 'professores', type: 'object', additionalProperties: false,
                properties: [
                    new OA\Property(property: 'usuario_id', type: 'integer'),
                    new OA\Property(property: 'siape_matricula', type: 'string'),
                    new OA\Property(property: 'departamento_area', type: 'string'),
                    new OA\Property(property: 'max_orientados', type: 'integer'),
                ],
            ),
            new OA\Schema(title: 'supervisores', type: 'object', additionalProperties: false,
                properties: [
                    new OA\Property(property: 'empresa_concedente_id', type: 'integer'),
                    new OA\Property(property: 'usuario_id', type: 'integer'),
                    new OA\Property(property: 'nome', type: 'string'),
                    new OA\Property(property: 'cargo', type: 'string'),
                    new OA\Property(property: 'formacao', type: 'string'),
                    new OA\Property(property: 'telefone', type: 'string'),
                    new OA\Property(property: 'email', type: 'string', format: 'email'),
                ],
            ),
        ]),
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

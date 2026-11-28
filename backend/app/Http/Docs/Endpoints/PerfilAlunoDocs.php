<?php

namespace App\Http\Docs\Endpoints;

use OpenApi\Attributes as OA;

#[OA\Post(
    path: '/api/aluno/ficha-matricula',
    summary: 'Anexar ficha em PDF',
    tags: ['Perfil e ficha de matrícula'],
    description: 'Apenas PDF de até 10 MB. Anexa sem encaminhar para análise.',
    security: [['bearerAuth' => []]],
    requestBody: new OA\RequestBody(
        required: true,
        content: new OA\MediaType(mediaType: 'multipart/form-data', schema: new OA\Schema(type: 'object', required: ['arquivo'],
            properties: [
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

#[OA\Get(
    path: '/api/aluno/ficha-matricula/arquivo',
    summary: 'Baixar versão armazenada em PDF',
    tags: ['Perfil e ficha de matrícula'],
    security: [['bearerAuth' => []]],
    responses: [
        new OA\Response(response: 200, description: 'Operação realizada com sucesso.', content: new OA\MediaType(mediaType: 'application/pdf', schema: new OA\Schema(type: 'string', format: 'binary'))),
        new OA\Response(response: 401, description: 'Token ausente ou inválido.'),
        new OA\Response(response: 403, description: 'Acesso não permitido.'),
        new OA\Response(response: 404, description: 'Recurso não encontrado.'),
        new OA\Response(response: 422, description: 'Dados inválidos ou regra de negócio não atendida.'),
    ],
)]

#[OA\Post(
    path: '/api/aluno/ficha-matricula/enviar',
    summary: 'Encaminhar ficha ao diretor',
    tags: ['Perfil e ficha de matrícula'],
    security: [['bearerAuth' => []]],
    responses: [
        new OA\Response(response: 200, description: 'Operação realizada com sucesso.'),
        new OA\Response(response: 401, description: 'Token ausente ou inválido.'),
        new OA\Response(response: 403, description: 'Acesso não permitido.'),
        new OA\Response(response: 404, description: 'Recurso não encontrado.'),
        new OA\Response(response: 422, description: 'Dados inválidos ou regra de negócio não atendida.'),
    ],
)]

#[OA\Get(
    path: '/api/aluno/ficha-matricula/pdf',
    summary: 'Gerar ficha de matrícula em PDF',
    tags: ['Perfil e ficha de matrícula'],
    description: 'GET usa os dados persistidos. A prévia POST combina os dados enviados com os dados salvos sem persistir alterações.',
    security: [['bearerAuth' => []]],
    responses: [
        new OA\Response(response: 200, description: 'Operação realizada com sucesso.', content: new OA\MediaType(mediaType: 'application/pdf', schema: new OA\Schema(type: 'string', format: 'binary'))),
        new OA\Response(response: 401, description: 'Token ausente ou inválido.'),
        new OA\Response(response: 403, description: 'Acesso não permitido.'),
        new OA\Response(response: 404, description: 'Recurso não encontrado.'),
        new OA\Response(response: 422, description: 'Dados inválidos ou regra de negócio não atendida.'),
    ],
)]

#[OA\Post(
    path: '/api/aluno/ficha-matricula/previa',
    summary: 'Gerar prévia da ficha sem salvar',
    tags: ['Perfil e ficha de matrícula'],
    description: 'GET usa os dados persistidos. A prévia POST combina os dados enviados com os dados salvos sem persistir alterações.',
    security: [['bearerAuth' => []]],
    requestBody: new OA\RequestBody(
        required: false,
        content: new OA\JsonContent(type: 'object',
            properties: [
                new OA\Property(property: 'naturalidade', type: 'string'),
                new OA\Property(property: 'uf_naturalidade', type: 'string'),
                new OA\Property(property: 'data_nascimento', type: 'string', format: 'date'),
                new OA\Property(property: 'filiacao', type: 'string'),
                new OA\Property(property: 'estado_civil', type: 'string'),
                new OA\Property(property: 'sexo', type: 'string'),
                new OA\Property(property: 'identidade', type: 'string'),
                new OA\Property(property: 'orgao_expedidor', type: 'string'),
                new OA\Property(property: 'telefone', type: 'string'),
                new OA\Property(property: 'telefone_fixo', type: 'string'),
                new OA\Property(property: 'logradouro', type: 'string'),
                new OA\Property(property: 'numero', type: 'string'),
                new OA\Property(property: 'complemento', type: 'string'),
                new OA\Property(property: 'bairro', type: 'string'),
                new OA\Property(property: 'cidade', type: 'string'),
                new OA\Property(property: 'uf', type: 'string'),
                new OA\Property(property: 'cep', type: 'string'),
                new OA\Property(property: 'serie_modulo_periodo', type: 'string'),
                new OA\Property(property: 'turno', type: 'string'),
                new OA\Property(property: 'tipo_curso', type: 'string'),
                new OA\Property(property: 'integralizou', type: 'string'),
                new OA\Property(property: 'semestre_integralizacao', type: 'string'),
            ],
        ),
    ),
    responses: [
        new OA\Response(response: 200, description: 'Operação realizada com sucesso.', content: new OA\MediaType(mediaType: 'application/pdf', schema: new OA\Schema(type: 'string', format: 'binary'))),
        new OA\Response(response: 401, description: 'Token ausente ou inválido.'),
        new OA\Response(response: 403, description: 'Acesso não permitido.'),
        new OA\Response(response: 404, description: 'Recurso não encontrado.'),
        new OA\Response(response: 422, description: 'Dados inválidos ou regra de negócio não atendida.'),
    ],
)]

#[OA\Get(
    path: '/api/aluno/perfil',
    summary: 'Consultar — Perfil e ficha de matrícula',
    tags: ['Perfil e ficha de matrícula'],
    security: [['bearerAuth' => []]],
    responses: [
        new OA\Response(response: 200, description: 'Operação realizada com sucesso.'),
        new OA\Response(response: 401, description: 'Token ausente ou inválido.'),
        new OA\Response(response: 403, description: 'Acesso não permitido.'),
        new OA\Response(response: 404, description: 'Recurso não encontrado.'),
        new OA\Response(response: 422, description: 'Dados inválidos ou regra de negócio não atendida.'),
    ],
)]

#[OA\Patch(
    path: '/api/aluno/perfil',
    summary: 'Atualizar — Perfil e ficha de matrícula',
    tags: ['Perfil e ficha de matrícula'],
    description: 'Atualização parcial dos dados editáveis do aluno. Nome, e-mail, CPF, matrícula e formação institucional são protegidos.',
    security: [['bearerAuth' => []]],
    requestBody: new OA\RequestBody(
        required: true,
        content: new OA\JsonContent(type: 'object',
            properties: [
                new OA\Property(property: 'naturalidade', type: 'string'),
                new OA\Property(property: 'uf_naturalidade', type: 'string'),
                new OA\Property(property: 'data_nascimento', type: 'string', format: 'date'),
                new OA\Property(property: 'filiacao', type: 'string'),
                new OA\Property(property: 'estado_civil', type: 'string'),
                new OA\Property(property: 'sexo', type: 'string'),
                new OA\Property(property: 'identidade', type: 'string'),
                new OA\Property(property: 'orgao_expedidor', type: 'string'),
                new OA\Property(property: 'telefone', type: 'string'),
                new OA\Property(property: 'telefone_fixo', type: 'string'),
                new OA\Property(property: 'logradouro', type: 'string'),
                new OA\Property(property: 'numero', type: 'string'),
                new OA\Property(property: 'complemento', type: 'string'),
                new OA\Property(property: 'bairro', type: 'string'),
                new OA\Property(property: 'cidade', type: 'string'),
                new OA\Property(property: 'uf', type: 'string'),
                new OA\Property(property: 'cep', type: 'string'),
                new OA\Property(property: 'serie_modulo_periodo', type: 'string'),
                new OA\Property(property: 'turno', type: 'string'),
                new OA\Property(property: 'tipo_curso', type: 'string'),
                new OA\Property(property: 'integralizou', type: 'string'),
                new OA\Property(property: 'semestre_integralizacao', type: 'string'),
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

#[OA\Get(
    path: '/api/diretor/fichas-matricula',
    summary: 'Listar fichas em análise',
    tags: ['Perfil e ficha de matrícula'],
    security: [['bearerAuth' => []]],
    responses: [
        new OA\Response(response: 200, description: 'Operação realizada com sucesso.'),
        new OA\Response(response: 401, description: 'Token ausente ou inválido.'),
        new OA\Response(response: 403, description: 'Acesso não permitido.'),
        new OA\Response(response: 404, description: 'Recurso não encontrado.'),
        new OA\Response(response: 422, description: 'Dados inválidos ou regra de negócio não atendida.'),
    ],
)]

#[OA\Patch(
    path: '/api/diretor/fichas-matricula/{documento}',
    summary: 'Aprovar ou devolver para ajustes',
    tags: ['Perfil e ficha de matrícula'],
    description: 'Acesso da Direção. Status DEFERIDO ou NECESSITA_AJUSTES, com observacoes obrigatórias no segundo caso.',
    security: [['bearerAuth' => []]],
    parameters: [
        new OA\Parameter(name: 'documento', in: 'path', required: true, schema: new OA\Schema(type: 'integer', minimum: 1)),
    ],
    requestBody: new OA\RequestBody(
        required: true,
        content: new OA\JsonContent(type: 'object', required: ['status'],
            properties: [
                new OA\Property(property: 'status', type: 'string'),
                new OA\Property(property: 'observacoes', type: 'string'),
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

#[OA\Get(
    path: '/api/diretor/fichas-matricula/{documento}/arquivo',
    summary: 'Baixar ficha para análise',
    tags: ['Perfil e ficha de matrícula'],
    security: [['bearerAuth' => []]],
    parameters: [
        new OA\Parameter(name: 'documento', in: 'path', required: true, schema: new OA\Schema(type: 'integer', minimum: 1)),
    ],
    responses: [
        new OA\Response(response: 200, description: 'Operação realizada com sucesso.', content: new OA\MediaType(mediaType: 'application/pdf', schema: new OA\Schema(type: 'string', format: 'binary'))),
        new OA\Response(response: 401, description: 'Token ausente ou inválido.'),
        new OA\Response(response: 403, description: 'Acesso não permitido.'),
        new OA\Response(response: 404, description: 'Recurso não encontrado.'),
        new OA\Response(response: 422, description: 'Dados inválidos ou regra de negócio não atendida.'),
    ],
)]
final class PerfilAlunoDocs {}

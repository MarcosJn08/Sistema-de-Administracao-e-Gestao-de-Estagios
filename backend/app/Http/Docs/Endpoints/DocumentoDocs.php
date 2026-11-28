<?php

namespace App\Http\Docs\Endpoints;

use OpenApi\Attributes as OA;

#[OA\Get(
    path: '/api/diretor/documentos-estagio',
    summary: 'Listar documentos dos alunos para a Direção',
    description: 'Inclui fichas de matrícula e documentos vinculados a estágios, com todas as situações registradas.',
    parameters: [new OA\Parameter(name: 'aluno_id', in: 'query', schema: new OA\Schema(type: 'integer', minimum: 1))],
    tags: ['Documentos de estágio'],
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
    path: '/api/estagios/{estagio}/catalogo-documentos',
    summary: 'Listar documentos disponíveis e permissões de edição',
    tags: ['Documentos de estágio'],
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

#[OA\Get(
    path: '/api/estagios/{estagio}/documentos',
    summary: 'Listar',
    tags: ['Documentos de estágio'],
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
    path: '/api/estagios/{estagio}/documentos',
    summary: 'Cadastrar',
    tags: ['Documentos de estágio'],
    description: 'Envio direto para análise usado pelo fluxo anterior. Para anexar sem enviar, use /documentos/arquivo. As avaliações usam o fluxo de anexo e encaminhamento.',
    security: [['bearerAuth' => []]],
    parameters: [
        new OA\Parameter(name: 'estagio', in: 'path', required: true, schema: new OA\Schema(type: 'integer', minimum: 1)),
    ],
    requestBody: new OA\RequestBody(
        required: true,
        content: new OA\MediaType(mediaType: 'multipart/form-data', schema: new OA\Schema(type: 'object', required: ['tipo', 'arquivo'],
            properties: [
                new OA\Property(property: 'tipo', type: 'string'),
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
    path: '/api/estagios/{estagio}/documentos/arquivo',
    summary: 'Anexar PDF como rascunho, sem encaminhar',
    tags: ['Documentos de estágio'],
    description: 'PDF de até 10 MB. Cria uma versão PENDENTE e preserva o histórico. Use o encaminhamento para iniciar a análise.',
    security: [['bearerAuth' => []]],
    parameters: [
        new OA\Parameter(name: 'estagio', in: 'path', required: true, schema: new OA\Schema(type: 'integer', minimum: 1)),
    ],
    requestBody: new OA\RequestBody(
        required: true,
        content: new OA\MediaType(mediaType: 'multipart/form-data', schema: new OA\Schema(type: 'object', required: ['tipo', 'arquivo'],
            properties: [
                new OA\Property(property: 'tipo', type: 'string'),
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

#[OA\Patch(
    path: '/api/estagios/{estagio}/documentos/{documento}/analise',
    summary: 'Aprovar ou devolver para ajustes',
    tags: ['Documentos de estágio'],
    description: 'Status DEFERIDO ou NECESSITA_AJUSTES. Envie observacoes ao solicitar ajustes.',
    security: [['bearerAuth' => []]],
    parameters: [
        new OA\Parameter(name: 'estagio', in: 'path', required: true, schema: new OA\Schema(type: 'integer', minimum: 1)),
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
    path: '/api/estagios/{estagio}/documentos/{documento}/download',
    summary: 'Baixar versão armazenada em PDF',
    tags: ['Documentos de estágio'],
    security: [['bearerAuth' => []]],
    parameters: [
        new OA\Parameter(name: 'estagio', in: 'path', required: true, schema: new OA\Schema(type: 'integer', minimum: 1)),
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

#[OA\Post(
    path: '/api/estagios/{estagio}/documentos/{documento}/encaminhar',
    summary: 'Encaminhar a última versão anexada para análise',
    tags: ['Documentos de estágio'],
    security: [['bearerAuth' => []]],
    parameters: [
        new OA\Parameter(name: 'estagio', in: 'path', required: true, schema: new OA\Schema(type: 'integer', minimum: 1)),
        new OA\Parameter(name: 'documento', in: 'path', required: true, schema: new OA\Schema(type: 'integer', minimum: 1)),
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
    path: '/api/estagios/{estagio}/documentos/{documento}/historico',
    summary: 'Consultar histórico de status',
    tags: ['Documentos de estágio'],
    security: [['bearerAuth' => []]],
    parameters: [
        new OA\Parameter(name: 'estagio', in: 'path', required: true, schema: new OA\Schema(type: 'integer', minimum: 1)),
        new OA\Parameter(name: 'documento', in: 'path', required: true, schema: new OA\Schema(type: 'integer', minimum: 1)),
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
    path: '/api/estagios/{estagio}/modelos-documentos/{tipo}',
    summary: 'Consultar campos ou gerar minuta em PDF',
    tags: ['Documentos de estágio'],
    description: 'GET retorna os campos preenchidos e editáveis. Com pdf=1 retorna a minuta em PDF. PATCH aceita o mapa campos com rótulos retornados pelo GET e valores textuais. Valores de origem são protegidos. A avaliação do aluno exige a carga horária obrigatória e a avaliação da concedente só pode ser editada pelo supervisor vinculado.',
    security: [['bearerAuth' => []]],
    parameters: [
        new OA\Parameter(name: 'estagio', in: 'path', required: true, schema: new OA\Schema(type: 'integer', minimum: 1)),
        new OA\Parameter(name: 'tipo', in: 'path', required: true, schema: new OA\Schema(type: 'string', enum: ['PLANO_ATIVIDADES', 'TCE', 'AVALIACAO_ALUNO', 'AVALIACAO_EMPRESA'])),
        new OA\Parameter(name: 'pdf', in: 'query', schema: new OA\Schema(type: 'integer', enum: [0, 1])),
    ],
    responses: [
        new OA\Response(response: 200, description: 'Operação realizada com sucesso.', content: [new OA\MediaType(mediaType: 'application/json'), new OA\MediaType(mediaType: 'application/pdf', schema: new OA\Schema(type: 'string', format: 'binary'))]),
        new OA\Response(response: 401, description: 'Token ausente ou inválido.'),
        new OA\Response(response: 403, description: 'Acesso não permitido.'),
        new OA\Response(response: 404, description: 'Recurso não encontrado.'),
        new OA\Response(response: 422, description: 'Dados inválidos ou regra de negócio não atendida.'),
    ],
)]

#[OA\Patch(
    path: '/api/estagios/{estagio}/modelos-documentos/{tipo}',
    summary: 'Salvar campos complementares da minuta',
    tags: ['Documentos de estágio'],
    description: 'GET retorna os campos preenchidos e editáveis. Com pdf=1 retorna a minuta em PDF. PATCH aceita o mapa campos com rótulos retornados pelo GET e valores textuais. Valores de origem são protegidos. A avaliação do aluno exige a carga horária obrigatória e a avaliação da concedente só pode ser editada pelo supervisor vinculado.',
    security: [['bearerAuth' => []]],
    parameters: [
        new OA\Parameter(name: 'estagio', in: 'path', required: true, schema: new OA\Schema(type: 'integer', minimum: 1)),
        new OA\Parameter(name: 'tipo', in: 'path', required: true, schema: new OA\Schema(type: 'string', enum: ['PLANO_ATIVIDADES', 'TCE', 'AVALIACAO_ALUNO', 'AVALIACAO_EMPRESA'])),
    ],
    requestBody: new OA\RequestBody(
        required: true,
        content: new OA\JsonContent(type: 'object', required: ['campos'],
            properties: [
                new OA\Property(property: 'campos', type: 'object', additionalProperties: new OA\AdditionalProperties(type: 'string')),
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
final class DocumentoDocs {}

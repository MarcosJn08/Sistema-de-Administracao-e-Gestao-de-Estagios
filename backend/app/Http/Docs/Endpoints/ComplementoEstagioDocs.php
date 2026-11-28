<?php

namespace App\Http\Docs\Endpoints;

use OpenApi\Attributes as OA;

#[OA\Put(
    path: '/api/estagios/{estagio}/avaliacao',
    summary: 'Registrar avaliação do estágio',
    tags: ['Complementos de estágio'],
    description: 'Aluno: auto_avaliacao. Concedente: nota_desempenho (0 a 10), conceito_atitude e parecer_final.',
    security: [['bearerAuth' => []]],
    parameters: [
        new OA\Parameter(name: 'estagio', in: 'path', required: true, schema: new OA\Schema(type: 'integer', minimum: 1)),
    ],
    requestBody: new OA\RequestBody(
        required: true,
        content: new OA\JsonContent(oneOf: [
            new OA\Schema(title: 'Aluno', type: 'object', additionalProperties: false, required: ['auto_avaliacao'],
                properties: [
                    new OA\Property(property: 'auto_avaliacao', type: 'string'),
                ],
            ),
            new OA\Schema(title: 'Concedente', type: 'object', additionalProperties: false, required: ['nota_desempenho', 'conceito_atitude', 'parecer_final'],
                properties: [
                    new OA\Property(property: 'nota_desempenho', type: 'number', minimum: 0, maximum: 10),
                    new OA\Property(property: 'conceito_atitude', type: 'string'),
                    new OA\Property(property: 'parecer_final', type: 'string'),
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

#[OA\Put(
    path: '/api/estagios/{estagio}/complementos/{tipo}',
    summary: 'Salvar complemento do estágio',
    tags: ['Complementos de estágio'],
    description: 'O corpo depende de tipo. Apólice: numero_apolice e nome_seguradora. Plano: objetivos, atividades_previstas e cronograma. Salubridade: local_estagio, condicoes_higiene, possui_epi e riscos_ocupacionais opcional. Relatório: resumo_atividades, relacao_teoria_pratica e dificuldades opcional.',
    security: [['bearerAuth' => []]],
    parameters: [
        new OA\Parameter(name: 'estagio', in: 'path', required: true, schema: new OA\Schema(type: 'integer', minimum: 1)),
        new OA\Parameter(name: 'tipo', in: 'path', required: true, schema: new OA\Schema(type: 'string', enum: ['apolice', 'plano', 'salubridade', 'relatorio'])),
    ],
    requestBody: new OA\RequestBody(
        required: true,
        content: new OA\JsonContent(oneOf: [
            new OA\Schema(title: 'Apólice', type: 'object', additionalProperties: false, required: ['numero_apolice', 'nome_seguradora'],
                properties: [
                    new OA\Property(property: 'numero_apolice', type: 'string'),
                    new OA\Property(property: 'nome_seguradora', type: 'string'),
                ],
            ),
            new OA\Schema(title: 'Plano', type: 'object', additionalProperties: false, required: ['objetivos', 'atividades_previstas', 'cronograma'],
                properties: [
                    new OA\Property(property: 'objetivos', type: 'string'),
                    new OA\Property(property: 'atividades_previstas', type: 'string'),
                    new OA\Property(property: 'cronograma', type: 'string'),
                ],
            ),
            new OA\Schema(title: 'Salubridade', type: 'object', additionalProperties: false, required: ['local_estagio', 'condicoes_higiene', 'possui_epi'],
                properties: [
                    new OA\Property(property: 'local_estagio', type: 'string'),
                    new OA\Property(property: 'condicoes_higiene', type: 'string'),
                    new OA\Property(property: 'possui_epi', type: 'boolean'),
                    new OA\Property(property: 'riscos_ocupacionais', type: 'string'),
                ],
            ),
            new OA\Schema(title: 'Relatório', type: 'object', additionalProperties: false, required: ['resumo_atividades', 'relacao_teoria_pratica'],
                properties: [
                    new OA\Property(property: 'resumo_atividades', type: 'string'),
                    new OA\Property(property: 'relacao_teoria_pratica', type: 'string'),
                    new OA\Property(property: 'dificuldades', type: 'string'),
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

#[OA\Post(
    path: '/api/estagios/{estagio}/relatorio/aprovacao',
    summary: 'Aprovar relatório de estágio',
    tags: ['Complementos de estágio'],
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
final class ComplementoEstagioDocs {}

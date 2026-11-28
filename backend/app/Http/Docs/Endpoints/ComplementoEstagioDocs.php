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

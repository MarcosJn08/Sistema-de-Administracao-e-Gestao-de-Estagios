<?php

namespace App\Http\Docs\Endpoints;

use OpenApi\Attributes as OA;

#[OA\Post(
    path: '/api/aluno/candidaturas',
    summary: 'Registrar candidatura à vaga',
    tags: ['Candidaturas'],
    description: 'Exige perfil completo e ficha encaminhada para análise. Bloqueia candidatura duplicada.',
    security: [['bearerAuth' => []]],
    requestBody: new OA\RequestBody(
        required: true,
        content: new OA\JsonContent(type: 'object', required: ['vaga_id', 'vaga', 'empresa', 'carta_apresentacao'],
            properties: [
                new OA\Property(property: 'vaga_id', type: 'string'),
                new OA\Property(property: 'vaga', type: 'string'),
                new OA\Property(property: 'empresa', type: 'string'),
                new OA\Property(property: 'carta_apresentacao', type: 'string'),
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
final class CandidaturaVagaDocs {}

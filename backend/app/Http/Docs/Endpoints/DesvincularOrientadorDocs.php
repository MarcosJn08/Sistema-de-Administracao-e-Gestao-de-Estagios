<?php

namespace App\Http\Docs\Endpoints;

use OpenApi\Attributes as OA;

#[OA\Delete(
    path: '/api/estagios/{estagio}/orientador',
    summary: 'Desvincular o professor orientador do estágio',
    tags: ['Orientação'],
    security: [['bearerAuth' => []]],
    parameters: [new OA\Parameter(name: 'estagio', in: 'path', required: true, schema: new OA\Schema(type: 'integer'))],
    responses: [
        new OA\Response(response: 200, description: 'Vínculo removido.'),
        new OA\Response(response: 401, description: 'Token ausente ou inválido.'),
        new OA\Response(response: 403, description: 'Acesso exclusivo da Direção.'),
        new OA\Response(response: 404, description: 'Estágio não encontrado.'),
        new OA\Response(response: 422, description: 'O estágio não permite desvincular o orientador.'),
    ],
)]
final class DesvincularOrientadorDocs {}

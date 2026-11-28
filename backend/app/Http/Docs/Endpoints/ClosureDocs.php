<?php

namespace App\Http\Docs\Endpoints;

use OpenApi\Attributes as OA;

#[OA\Get(
    path: '/api/status',
    summary: 'Consultar disponibilidade da API',
    tags: ['Serviço'],
    responses: [
        new OA\Response(response: 200, description: 'Operação realizada com sucesso.'),
    ],
)]
final class ClosureDocs {}

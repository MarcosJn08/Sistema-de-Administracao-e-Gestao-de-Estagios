<?php

namespace App\Http\Docs\Orientacao;

use App\Http\Requests\VincularOrientadorRequest;
use App\Models\Estagio;
use App\Services\OrientadorService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use OpenApi\Attributes as OA;

trait OrientadorDocs
{
    #[OA\Get(
        path: '/api/orientadores',
        summary: 'Listar orientadores e discentes para a Direção',
        security: [['bearerAuth' => []]],
        tags: ['Orientação de estágio'],
        responses: [
            new OA\Response(response: 200, description: 'Orientadores com departamento, disponibilidade e discentes, além dos rascunhos sem orientador.'),
            new OA\Response(response: 401, description: 'Não autenticado.'),
            new OA\Response(response: 403, description: 'Acesso exclusivo da Direção.'),
        ]
    )]
    abstract public function index(OrientadorService $service): JsonResponse;

    #[OA\Patch(
        path: '/api/estagios/{id}/orientador',
        summary: 'Vincular ou trocar o orientador de um estágio',
        security: [['bearerAuth' => []]],
        tags: ['Orientação de estágio'],
        requestBody: new OA\RequestBody(required: true, content: new OA\JsonContent(
            required: ['professor_orientador_id'],
            properties: [new OA\Property(property: 'professor_orientador_id', type: 'integer', minimum: 1)]
        )),
        parameters: [new OA\Parameter(name: 'id', in: 'path', required: true, schema: new OA\Schema(type: 'integer'))],
        responses: [
            new OA\Response(response: 200, description: 'Vínculo salvo.'),
            new OA\Response(response: 401, description: 'Não autenticado.'),
            new OA\Response(response: 403, description: 'Acesso exclusivo da Direção.'),
            new OA\Response(response: 404, description: 'Estágio não encontrado.'),
            new OA\Response(response: 422, description: 'Orientador inválido, inativo ou sem vagas, ou estágio finalizado.'),
        ]
    )]
    abstract public function vincular(VincularOrientadorRequest $request, Estagio $estagio, OrientadorService $service): JsonResponse;

    #[OA\Get(
        path: '/api/orientador/meus-discentes',
        summary: 'Listar os discentes vinculados ao orientador autenticado',
        security: [['bearerAuth' => []]],
        tags: ['Orientação de estágio'],
        responses: [
            new OA\Response(response: 200, description: 'Discentes e estágios do orientador autenticado.'),
            new OA\Response(response: 401, description: 'Não autenticado.'),
            new OA\Response(response: 403, description: 'Acesso exclusivo de professores.'),
        ]
    )]
    abstract public function meusDiscentes(Request $request, OrientadorService $service): JsonResponse;
}

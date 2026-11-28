<?php

namespace App\Http\Docs\Estagio;

use App\Http\Requests\CancelarEstagioRequest;
use App\Models\Estagio;
use App\Services\EncerramentoEstagioService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use OpenApi\Attributes as OA;

trait EncerramentoEstagioDocs
{
    #[OA\Post(
        path: '/api/estagios/{id}/cancelar-desvio-funcao',
        summary: 'Cancelar estágio por desvio de função (RN08)',
        description: 'Aplica a RN08 por desvio de função ou incompatibilidade com o PPC. A transição para CANCELADO_DESVIO_FUNCAO parte de EM_ANALISE ou EM_ANDAMENTO. Repetir um cancelamento já registrado retorna o estado atual e preserva o primeiro registro.',
        security: [['bearerAuth' => []]],
        tags: ['Estágios'],
        requestBody: new OA\RequestBody(required: true, content: new OA\JsonContent(
            required: ['justificativa_pedagogica'],
            properties: [new OA\Property(
                property: 'justificativa_pedagogica',
                type: 'string',
                maxLength: 2000,
                minLength: CancelarEstagioRequest::MINIMO_PARECER,
            )],
        )),
        parameters: [new OA\Parameter(name: 'id', in: 'path', required: true, schema: new OA\Schema(type: 'integer'))],
        responses: [
            new OA\Response(response: 200, description: 'Estágio cancelado, com as horas assinadas preservadas.'),
            new OA\Response(response: 401, description: 'Não autenticado.'),
            new OA\Response(response: 403, description: 'Acesso exclusivo da Direção ou do orientador atribuído.'),
            new OA\Response(response: 404, description: 'Estágio não encontrado.'),
            new OA\Response(response: 422, description: 'Parecer inválido ou transição indisponível para o estado do estágio.'),
        ],
    )]
    abstract public function cancelarDesvioFuncao(CancelarEstagioRequest $request, Estagio $estagio, EncerramentoEstagioService $service): JsonResponse;

    #[OA\Post(
        path: '/api/estagios/{id}/encerrar',
        summary: 'Encerrar administrativamente um estágio',
        security: [['bearerAuth' => []]],
        tags: ['Estágios'],
        requestBody: new OA\RequestBody(required: true, content: new OA\JsonContent(
            required: ['motivo'],
            properties: [new OA\Property(property: 'motivo', type: 'string', maxLength: 2000)],
        )),
        parameters: [new OA\Parameter(name: 'id', in: 'path', required: true, schema: new OA\Schema(type: 'integer'))],
        responses: [
            new OA\Response(response: 200, description: 'Estágio encerrado.'),
            new OA\Response(response: 401, description: 'Não autenticado.'),
            new OA\Response(response: 403, description: 'Acesso exclusivo da Direção.'),
            new OA\Response(response: 404, description: 'Estágio não encontrado.'),
            new OA\Response(response: 422, description: 'Motivo inválido ou estado incompatível com o encerramento.'),
        ],
    )]
    abstract public function encerrar(Request $request, Estagio $estagio, EncerramentoEstagioService $service): JsonResponse;
}

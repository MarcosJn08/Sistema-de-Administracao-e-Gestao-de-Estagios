<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreFrequenciaMensalRequest;
use App\Models\Estagio;
use App\Models\FrequenciaMensal;
use App\Services\FrequenciaMensalService;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class FrequenciaMensalController extends Controller
{
    use AuthorizesRequests;

    public function __construct(
        private readonly FrequenciaMensalService $service
    ) {}

    public function index(Request $request, Estagio $estagio): JsonResponse
    {
        $this->authorize('view', [FrequenciaMensal::class, $estagio]);

        $resultado = $this->service->listarPorEstagio($estagio);

        return response()->json([
            'success' => true,
            'message' => 'Frequências mensais recuperadas com sucesso.',
            'data' => $resultado,
        ]);
    }

    public function store(StoreFrequenciaMensalRequest $request, Estagio $estagio): JsonResponse
    {
        $this->authorize('create', [FrequenciaMensal::class, $estagio]);

        $arquivo = $request->file('arquivo');
        $frequencia = $this->service->enviarFolhaMensal($estagio, $request->validated(), $arquivo);

        return response()->json([
            'success' => true,
            'message' => 'Folha de frequência mensal enviada com sucesso.',
            'data' => $frequencia,
        ], 201);
    }

    public function aprovar(Request $request, FrequenciaMensal $frequenciaMensal): JsonResponse
    {
        $this->authorize('approve', $frequenciaMensal);

        $frequencia = $this->service->aprovarFolha($frequenciaMensal, $request->user());

        return response()->json([
            'success' => true,
            'message' => 'Folha de frequência mensal aprovada e horas computadas com sucesso.',
            'data' => $frequencia,
        ]);
    }
}

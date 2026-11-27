<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\RegistroFrequenciaCampoRequest;
use App\Models\FrequenciaDiariaCampo;
use App\Services\FrequenciaCampoService;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class FrequenciaCampoController extends Controller
{
    use AuthorizesRequests;

    public function __construct(
        private readonly FrequenciaCampoService $service
    ) {}

    public function turmas(Request $request): JsonResponse
    {
        $this->authorize('viewAny', FrequenciaDiariaCampo::class);

        $turmas = $this->service->listarTurmasEEstagiarios($request->user());

        return response()->json([
            'success' => true,
            'message' => 'Turmas e estagiários de campo listados com sucesso.',
            'data' => $turmas,
        ]);
    }

    public function lancarLote(RegistroFrequenciaCampoRequest $request): JsonResponse
    {
        $this->authorize('create', FrequenciaDiariaCampo::class);

        $resultado = $this->service->registrarLote($request->user(), $request->validated());

        return response()->json([
            'success' => true,
            'message' => 'Presença e horas diárias lançadas com sucesso.',
            'data' => $resultado,
        ], 201);
    }

    public function historicoAluno(Request $request, int $alunoId): JsonResponse
    {
        $this->authorize('viewAluno', [FrequenciaDiariaCampo::class, $alunoId]);

        $dados = $this->service->historicoAluno($alunoId);

        return response()->json([
            'success' => true,
            'message' => 'Extrato diário de frequência carregado com sucesso.',
            'data' => $dados,
        ]);
    }
}

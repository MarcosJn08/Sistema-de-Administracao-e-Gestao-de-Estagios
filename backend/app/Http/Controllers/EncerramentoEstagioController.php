<?php

namespace App\Http\Controllers;

use App\Http\Docs\Estagio\EncerramentoEstagioDocs;
use App\Http\Requests\CancelarEstagioRequest;
use App\Models\Estagio;
use App\Services\EncerramentoEstagioService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;

class EncerramentoEstagioController extends Controller
{
    use EncerramentoEstagioDocs;

    public function cancelarDesvioFuncao(CancelarEstagioRequest $request, Estagio $estagio, EncerramentoEstagioService $service): JsonResponse
    {
        $estagio = $service->cancelarDesvioFuncao($estagio, $request->user(), $request->validated('justificativa_pedagogica'));

        return $this->successResponse($estagio, 'Estágio cancelado por desvio de função.');
    }

    public function encerrar(Request $request, Estagio $estagio, EncerramentoEstagioService $service): JsonResponse
    {
        Gate::authorize('transition', $estagio);
        $dados = $request->validate(['motivo' => ['required', 'string', 'max:2000']]);
        $estagio = $service->encerrar($estagio, $request->user(), $dados['motivo']);

        return $this->successResponse($estagio, 'Estágio encerrado.');
    }
}

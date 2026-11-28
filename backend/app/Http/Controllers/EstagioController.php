<?php

namespace App\Http\Controllers;

use App\Enums\StatusEstagio;
use App\Http\Requests\CancelarEstagioRequest;
use App\Models\Estagio;
use App\Services\EncerramentoEstagioService;
use App\Services\EstagioService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Illuminate\Validation\Rule;

class EstagioController extends Controller
{
    public function status(Request $request, Estagio $estagio, EstagioService $service, EncerramentoEstagioService $encerramento): JsonResponse
    {
        Gate::authorize('transition', $estagio);
        $data = $request->validate([
            'status' => ['required', Rule::enum(StatusEstagio::class)],
            'motivo' => $request->input('status') === StatusEstagio::CANCELADO_DESVIO_FUNCAO->value
                ? CancelarEstagioRequest::REGRAS_PARECER
                : ['nullable', 'string', 'max:2000'],
        ]);
        $destino = StatusEstagio::from($data['status']);
        $autor = $request->user();
        $motivo = $data['motivo'] ?? null;
        $estagio = match ($destino) {
            StatusEstagio::CANCELADO_DESVIO_FUNCAO => $encerramento->cancelarDesvioFuncao($estagio, $autor, $motivo),
            StatusEstagio::ENCERRADO => $encerramento->encerrar($estagio, $autor, $motivo),
            default => $service->transicionar($estagio, $destino, $autor, $motivo),
        };

        return $this->successResponse($estagio);
    }
}


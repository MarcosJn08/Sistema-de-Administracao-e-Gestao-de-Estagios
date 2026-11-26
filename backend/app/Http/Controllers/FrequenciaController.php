<?php

namespace App\Http\Controllers;

use App\Enums\StatusEstagio;
use App\Models\DiarioFrequencia;
use App\Models\Estagio;
use App\Services\ContratoEstagioService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Gate;
use Illuminate\Validation\ValidationException;

class FrequenciaController extends Controller
{
    public function index(Request $request, Estagio $estagio): JsonResponse
    {
        Gate::authorize('view', $estagio);
        $data = $request->validate(['per_page' => 'sometimes|integer|min:1|max:100']);

        return $this->successResponse(['frequencias' => $estagio->frequencias()->orderByDesc('data')->paginate($data['per_page'] ?? 20), 'horas_cumpridas' => $estagio->horasCumpridas()]);
    }

    public function store(Request $request, Estagio $estagio): JsonResponse
    {
        return $this->save($request, $estagio, null);
    }

    public function update(Request $request, Estagio $estagio, DiarioFrequencia $frequencia): JsonResponse
    {
        abort_unless($frequencia->estagio_id === $estagio->id, 404);

        return $this->save($request, $estagio, $frequencia);
    }

    private function save(Request $request, Estagio $estagio, ?DiarioFrequencia $frequencia): JsonResponse
    {
        Gate::authorize('submit', $estagio);
        $data = $request->validate(['data' => 'required|date_format:Y-m-d|before_or_equal:today', 'hora_entrada' => 'required|date_format:H:i', 'hora_saida' => 'required|date_format:H:i|after:hora_entrada', 'horas_diarias' => 'prohibited', 'assinado_supervisor' => 'prohibited']);

        return DB::transaction(function () use ($estagio, $frequencia, $data) {
            $estagio = Estagio::whereKey($estagio->id)->lockForUpdate()->firstOrFail();
            $registro = $frequencia ? DiarioFrequencia::whereKey($frequencia->id)->lockForUpdate()->firstOrFail() : new DiarioFrequencia;
            if ($estagio->status !== StatusEstagio::EM_ANDAMENTO || $registro->assinado_supervisor) {
                throw ValidationException::withMessages(['frequencia' => 'Só frequências não assinadas de estágios ativos podem ser editadas.']);
            }
            if ($data['data'] < $estagio->data_inicio->format('Y-m-d') || $data['data'] > $estagio->data_termino->format('Y-m-d')) {
                throw ValidationException::withMessages(['data' => 'A data deve estar dentro do período do estágio.']);
            }
            $minutes = function (string $hora): int {
                [$h, $m] = explode(':', $hora);

                return (int) $h * 60 + (int) $m;
            };
            $horas = round(($minutes($data['hora_saida']) - $minutes($data['hora_entrada'])) / 60, 2);
            if ($horas <= 0 || $horas > (float) $estagio->carga_horaria_diaria) {
                throw ValidationException::withMessages(['hora_saida' => 'A duração excede a carga horária diária do estágio.']);
            }
            if ($estagio->frequencias()->whereDate('data', $data['data'])->when($registro->exists, fn ($q) => $q->where('id', '!=', $registro->id))->exists()) {
                throw ValidationException::withMessages(['data' => 'Já existe frequência neste dia.']);
            }
            app(ContratoEstagioService::class)->validarFrequencia($estagio, $data['data'], $horas, $registro->id);
            $registro->fill($data + ['estagio_id' => $estagio->id, 'horas_diarias' => $horas])->save();

            return $this->successResponse($registro, 'Frequência registrada.', $frequencia ? 200 : 201);
        });
    }

    public function sign(Request $request, Estagio $estagio, DiarioFrequencia $frequencia): JsonResponse
    {
        Gate::authorize('sign', $estagio);
        abort_unless($frequencia->estagio_id === $estagio->id, 404);

        return DB::transaction(function () use ($request, $estagio, $frequencia) {
            $estagio = Estagio::whereKey($estagio->id)->lockForUpdate()->firstOrFail();
            $frequencia = DiarioFrequencia::whereKey($frequencia->id)->lockForUpdate()->firstOrFail();
            if ($estagio->status !== StatusEstagio::EM_ANDAMENTO || $frequencia->assinado_supervisor) {
                throw ValidationException::withMessages(['frequencia' => 'Frequência já assinada ou estágio não está ativo.']);
            }
            app(ContratoEstagioService::class)->validarFrequencia($estagio, $frequencia->data->toDateString(), (float) $frequencia->horas_diarias, $frequencia->id);
            $frequencia->forceFill(['assinado_supervisor' => true, 'assinado_por' => $request->user()->id, 'assinado_em' => now()])->save();

            return $this->successResponse($frequencia);
        });
    }
}

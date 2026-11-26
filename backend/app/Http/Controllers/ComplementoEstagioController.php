<?php

namespace App\Http\Controllers;

use App\Models\Estagio;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Gate;
use Illuminate\Validation\ValidationException;

class ComplementoEstagioController extends Controller
{
    public function save(Request $request, Estagio $estagio, string $tipo): JsonResponse
    {
        Gate::authorize('submit', $estagio);
        $rules = match ($tipo) {
            'apolice' => ['numero_apolice' => 'required|string|max:255', 'nome_seguradora' => 'required|string|max:255'],
            'plano' => ['objetivos' => 'required|string|max:10000', 'atividades_previstas' => 'required|string|max:10000', 'cronograma' => 'required|string|max:10000'],
            'salubridade' => ['local_estagio' => 'required|string|max:255', 'condicoes_higiene' => 'required|string|max:10000', 'possui_epi' => 'required|boolean', 'riscos_ocupacionais' => 'nullable|string|max:10000'],
            'relatorio' => ['resumo_atividades' => 'required|string|max:10000', 'relacao_teoria_pratica' => 'required|string|max:10000', 'dificuldades' => 'nullable|string|max:10000'],
            default => abort(404),
        };
        $data = $request->validate($rules + ['aprovado' => 'prohibited', 'parecer_orientador' => 'prohibited']);

        return DB::transaction(function () use ($estagio, $tipo, $data) {
            $estagio = Estagio::whereKey($estagio->id)->lockForUpdate()->firstOrFail();
            if ($estagio->estaFinalizado() || ($tipo !== 'relatorio' && $estagio->status->value !== 'RASCUNHO')) {
                throw ValidationException::withMessages(['estagio' => 'Este complemento não pode ser editado neste estado.']);
            }
            if ($tipo === 'relatorio' && $estagio->relatorio?->aprovado) {
                throw ValidationException::withMessages(['relatorio' => 'Um relatório aprovado não pode ser alterado.']);
            }

            return $this->successResponse($estagio->$tipo()->updateOrCreate(['estagio_id' => $estagio->id], $data));
        });
    }

    public function approveReport(Request $request, Estagio $estagio): JsonResponse
    {
        Gate::authorize('review', $estagio);

        return DB::transaction(function () use ($request, $estagio) {
            $estagio = Estagio::whereKey($estagio->id)->lockForUpdate()->firstOrFail();
            Gate::authorize('review', $estagio);
            if ($estagio->status->value !== 'EM_ANDAMENTO') {
                throw ValidationException::withMessages(['estagio' => 'O estágio deve estar em andamento.']);
            }
            $relatorio = $estagio->relatorio()->firstOrFail();
            if ($relatorio->aprovado) {
                throw ValidationException::withMessages(['relatorio' => 'Relatório já aprovado.']);
            }
            $relatorio->forceFill(['aprovado' => true, 'aprovado_por' => $request->user()->id, 'aprovado_em' => now()])->save();

            return $this->successResponse($relatorio);
        });
    }

    public function avaliacao(Request $request, Estagio $estagio): JsonResponse
    {
        Gate::authorize('view', $estagio);
        $perfil = $request->user()->perfil->value;
        abort_unless(in_array($perfil, ['ALUNO', 'EMPRESA'], true), 403);
        $data = $request->validate($perfil === 'ALUNO'
            ? ['auto_avaliacao' => 'required|string|max:10000']
            : ['nota_desempenho' => 'required|numeric|min:0|max:10|decimal:0,2', 'conceito_atitude' => 'required|string|max:255', 'parecer_final' => 'required|string|max:10000']);

        return DB::transaction(function () use ($estagio, $perfil, $data) {
            $estagio = Estagio::whereKey($estagio->id)->lockForUpdate()->firstOrFail();
            if ($estagio->status->value !== 'EM_ANDAMENTO') {
                throw ValidationException::withMessages(['estagio' => 'O estágio deve estar em andamento.']);
            }

            return $this->successResponse($estagio->avaliacoes()->updateOrCreate(['tipo' => $perfil === 'ALUNO' ? 'estagiario' : 'concedente'], $data));
        });
    }
}

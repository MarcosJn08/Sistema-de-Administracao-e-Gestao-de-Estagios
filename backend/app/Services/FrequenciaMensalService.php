<?php

namespace App\Services;

use App\Enums\StatusEstagio;
use App\Models\Estagio;
use App\Models\FrequenciaMensal;
use App\Models\User;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class FrequenciaMensalService
{
    public function listarPorEstagio(Estagio $estagio): array
    {
        $frequencias = $estagio->frequenciasMensais()
            ->with(['validadoPor.usuario'])
            ->orderByDesc('ano_competencia')
            ->orderByDesc('mes_competencia')
            ->get();

        return [
            'estagio_id' => $estagio->id,
            'horas_cumpridas_total' => $estagio->horasCumpridas(),
            'frequencias' => $frequencias->map(fn ($f) => [
                'id' => $f->id,
                'mes_competencia' => $f->mes_competencia,
                'ano_competencia' => $f->ano_competencia,
                'competencia_formatada' => sprintf('%02d/%d', $f->mes_competencia, $f->ano_competencia),
                'total_horas_mes' => (float) $f->total_horas_mes,
                'arquivo_path' => $f->arquivo_path,
                'status' => $f->status,
                'validado_por' => $f->validadoPor?->usuario?->nome ?? $f->validadoPor?->usuario?->name,
                'validado_em' => $f->validado_em?->toIso8601String(),
                'created_at' => $f->created_at?->toIso8601String(),
            ]),
        ];
    }

    public function enviarFolhaMensal(Estagio $estagio, array $dados, UploadedFile $arquivo): FrequenciaMensal
    {
        if ($estagio->status !== StatusEstagio::EM_ANDAMENTO) {
            throw ValidationException::withMessages([
                'estagio' => ['Apenas estágios ativos (em andamento) podem receber envio de frequência.'],
            ]);
        }

        $mes = (int) $dados['mes_competencia'];
        $ano = (int) $dados['ano_competencia'];

        $inicioEstagio = $estagio->data_inicio;
        $terminoEstagio = $estagio->data_termino;

        $primeiroDiaMes = \Carbon\Carbon::create($ano, $mes, 1)->startOfMonth();
        $ultimoDiaMes = \Carbon\Carbon::create($ano, $mes, 1)->endOfMonth();

        if ($ultimoDiaMes->lt($inicioEstagio) || $primeiroDiaMes->gt($terminoEstagio)) {
            throw ValidationException::withMessages([
                'mes_competencia' => ['O mês/ano informado está fora do período de vigência do estágio.'],
            ]);
        }

        $seisMesesAtras = now()->subMonths(6)->startOfMonth();
        if ($primeiroDiaMes->lt($seisMesesAtras)) {
            throw ValidationException::withMessages([
                'mes_competencia' => ['Conforme a RN10, a periodicidade máxima para envio e validação é de até 6 meses retroativos.'],
            ]);
        }

        $jaExiste = $estagio->frequenciasMensais()
            ->where('mes_competencia', $mes)
            ->where('ano_competencia', $ano)
            ->first();

        if ($jaExiste && $jaExiste->status === 'APROVADO') {
            throw ValidationException::withMessages([
                'mes_competencia' => ['A folha de frequência desta competência já foi validada e aprovada.'],
            ]);
        }

        $caminhoArquivo = $arquivo->store("estagios/{$estagio->id}/frequencias_mensais", 'local');

        if ($jaExiste) {
            $jaExiste->update([
                'total_horas_mes' => $dados['total_horas_mes'],
                'arquivo_path' => $caminhoArquivo,
                'status' => 'PENDENTE',
                'validado_por' => null,
                'validado_em' => null,
            ]);
            return $jaExiste;
        }

        return FrequenciaMensal::create([
            'estagio_id' => $estagio->id,
            'mes_competencia' => $mes,
            'ano_competencia' => $ano,
            'total_horas_mes' => $dados['total_horas_mes'],
            'arquivo_path' => $caminhoArquivo,
            'status' => 'PENDENTE',
        ]);
    }

    public function aprovarFolha(FrequenciaMensal $frequenciaMensal, User $user): FrequenciaMensal
    {
        if ($frequenciaMensal->status === 'APROVADO') {
            throw ValidationException::withMessages([
                'frequencia' => ['Esta folha de frequência já foi aprovada anteriormente.'],
            ]);
        }

        $orientadorId = null;
        if ($user->professor) {
            $orientadorId = $user->professor->id;
        } elseif ($user->role === 'diretor') {
            $orientadorId = $frequenciaMensal->estagio->professor_orientador_id ?? 1;
        }

        return DB::transaction(function () use ($frequenciaMensal, $orientadorId) {
            $frequenciaMensal->update([
                'status' => 'APROVADO',
                'validado_por' => $orientadorId,
                'validado_em' => now(),
            ]);

            return $frequenciaMensal->fresh(['validadoPor.usuario', 'estagio']);
        });
    }
}

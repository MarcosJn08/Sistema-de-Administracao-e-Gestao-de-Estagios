<?php

namespace App\Http\Resources;

use App\Enums\StatusDocumento;
use App\Models\Documento;
use App\Models\Estagio;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class DiscenteOrientadoResource extends JsonResource
{
    public static function agrupar(Collection $estagios): array
    {
        return $estagios->groupBy('aluno_id')->values()->map(fn (Collection $vinculos) => new static($vinculos))->all();
    }

    public function toArray(Request $request): array
    {
        $aluno = $this->resource->first()->aluno;

        return [
            'id' => $aluno->id,
            'nome' => $aluno->usuario->nome ?? $aluno->usuario->name,
            'email' => $aluno->usuario->email,
            'matricula' => $aluno->matricula,
            'curso' => $aluno->turma->curso->nome,
            'semestre' => $aluno->turma->semestre,
            'carga_horaria_exigida' => $aluno->cargaHorariaExigida(),
            'estagios' => $this->resource->map(fn (Estagio $estagio) => [
                'id' => $estagio->id,
                'status' => $estagio->status->value,
                'empresa' => $estagio->empresa->razao_social,
                'supervisor' => $estagio->supervisor->nome,
                'data_inicio' => $estagio->data_inicio->toDateString(),
                'data_termino' => $estagio->data_termino->toDateString(),
                'horas_cumpridas' => (float) $estagio->horas_cumpridas,
                'documentos' => $estagio->documentos->map(fn (Documento $documento) => [
                    'id' => $documento->id,
                    'tipo' => $documento->tipo->value,
                    'status' => $documento->status->value,
                    'data_envio' => $documento->created_at?->toDateString(),
                    'observacoes' => $documento->observacoes,
                    'tem_arquivo' => (bool) $documento->arquivo_path,
                    'pode_avaliar' => ! $estagio->estaFinalizado()
                        && $documento->status === StatusDocumento::EM_ANALISE && (bool) $documento->arquivo_path,
                ])->all(),
            ])->values()->all(),
        ];
    }
}

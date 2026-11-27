<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class EstagioResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $horas = $this->horasCumpridas();

        return [
            'id' => $this->id, 'aluno_id' => $this->aluno_id, 'curso_id' => $this->curso_id,
            'empresa_concedente_id' => $this->empresa_concedente_id,
            'supervisor_empresa_id' => $this->supervisor_empresa_id,
            'professor_orientador_id' => $this->professor_orientador_id,
            'cargo' => $this->cargo, 'modalidade' => $this->modalidade->value,
            'status' => $this->status->value,
            'data_inicio' => $this->data_inicio->toDateString(), 'data_termino' => $this->data_termino->toDateString(),
            'carga_horaria_diaria' => $this->carga_horaria_diaria,
            'carga_horaria_semanal' => $this->carga_horaria_semanal, 'meta_horas_tce' => $this->meta_horas_tce,
            'horas_cumpridas' => $horas,
            'horas_restantes_tce' => $this->meta_horas_tce === null ? null : max(0, (float) $this->meta_horas_tce - $horas),
            'bolsa_auxilio' => $this->bolsa_auxilio,
            'encerrado_em' => $this->encerrado_em?->toIso8601String(), 'motivo_encerramento' => $this->motivo_encerramento,
            'aluno' => ['id' => $this->aluno->id, 'nome' => $this->aluno->usuario?->nome, 'matricula' => $this->aluno->matricula],
            'curso' => $this->curso ? ['id' => $this->curso->id, 'nome' => $this->curso->nome] : null,
            'empresa' => ['id' => $this->empresa->id, 'razao_social' => $this->empresa->razao_social, 'cnpj' => $this->empresa->cnpj],
            'supervisor' => ['id' => $this->supervisor->id, 'nome' => $this->supervisor->nome],
            'orientador' => ['id' => $this->orientador->id, 'nome' => $this->orientador->usuario?->nome],
            'apolice' => $this->apolice, 'plano' => $this->plano,
            'documentos' => $this->documentos,
        ];
    }
}

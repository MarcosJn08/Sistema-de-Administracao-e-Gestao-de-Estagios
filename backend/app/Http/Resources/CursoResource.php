<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class CursoResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'nome' => $this->nome,
            'codigo' => $this->codigo,
            'modalidade' => $this->modalidade,
            'horas_minimas_estagio' => $this->horas_minimas_estagio ?? $this->carga_horaria_estagio,
            'carga_horaria_estagio' => $this->carga_horaria_estagio ?? $this->horas_minimas_estagio,
            'permite_aproveitamento_projetos' => (bool) $this->permite_aproveitamento_projetos,
            'modalidade_estagio' => $this->modalidade_estagio ?? 'orientado',
            'status' => is_object($this->status) ? $this->status->value : ($this->status ?? 'ativo'),
            'created_at' => $this->created_at?->toISOString(),
            'updated_at' => $this->updated_at?->toISOString(),
            'deleted_at' => $this->deleted_at?->toISOString(),
        ];
    }
}

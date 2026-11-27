<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class OrientadorResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $ativo = $this->resource->contaAtiva();

        return [
            'id' => $this->id,
            'usuario_id' => $this->usuario_id,
            'nome' => $this->usuario->nome ?? $this->usuario->name,
            'email' => $this->usuario->email,
            'cpf' => $this->usuario->cpf,
            'siape' => $this->siape_matricula,
            'departamento' => $this->departamento_area,
            'titulacao' => $this->titulacao,
            'telefone' => $this->telefone,
            'area_atuacao' => $this->area_atuacao,
            'regime_trabalho' => $this->regime_trabalho,
            'cadastro_editavel' => ! $this->usuario->trashed(),
            'ativo' => $ativo,
            'disponivel' => $ativo && $this->resource->podeOrientarMais(),
            'max_orientados' => $this->max_orientados,
            'estagios_ativos' => $this->estagios_ativos_count,
            'discentes' => DiscenteOrientadoResource::agrupar($this->estagios),
        ];
    }
}

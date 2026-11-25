<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class UsuarioResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $perfil = $this->perfil instanceof \BackedEnum
            ? $this->perfil->value
            : strtoupper((string) ($this->perfil ?? $this->role ?? ''));

        $role = strtolower($perfil);

        return [
            'id'         => $this->id,
            'nome'       => $this->nome ?? $this->name,
            'email'      => $this->email,
            'cpf'        => $this->cpf,
            'perfil'     => $perfil,
            'role'       => $role,
            'status'     => $this->status ?? ($this->is_active ? 'ativo' : 'inativo'),
            'matricula'       => $this->when($role === 'aluno', $this->matricula),
            'siape'           => $this->when(in_array($role, ['professor', 'diretor'], true), $this->siape),
            'cnpj'            => $this->when($role === 'empresa', $this->cnpj),
            'titulacao'       => $this->when($role === 'professor', $this->professor?->titulacao),
            'departamento'    => $this->when($role === 'professor', $this->professor?->departamento_area),
            'area_atuacao'    => $this->when($role === 'professor', $this->professor?->area_atuacao),
            'regime_trabalho' => $this->when($role === 'professor', $this->professor?->regime_trabalho),
            'max_orientados'  => $this->when($role === 'professor', $this->professor?->max_orientados),
            'telefone'        => $this->when(in_array($role, ['professor', 'aluno'], true), $this->professor?->telefone ?? $this->aluno?->telefone),
            'curso'           => $this->when($role === 'aluno', $this->aluno?->curso_nome ?? $this->aluno?->curso?->nome),
            'deleted_at'      => $this->deleted_at?->toIso8601String(),
            'created_at' => $this->created_at?->toIso8601String(),
            'updated_at' => $this->updated_at?->toIso8601String(),
        ];
    }
}

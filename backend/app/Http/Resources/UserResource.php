<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class UserResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $role = $this->role ?? ($this->perfil instanceof \BackedEnum ? strtolower($this->perfil->value) : strtolower((string) $this->perfil));

        // token_plain é definido pelo AuthService apenas no login via e-mail legado
        $plainToken = $this->resource->_token_plain ?? null;
        $isLegacy = $plainToken !== null || (bool) $request->attributes->get('_legacy_email');

        $aluno = $role === 'aluno' ? $this->aluno : null;
        $turma = $aluno?->turma;
        $curso = $turma?->curso;

        return [
            'id' => $this->id,
            'name' => $this->name ?? $this->nome,
            'email' => $this->email,
            'role' => $role,
            'matricula' => $this->when($role === 'aluno', $aluno?->matricula ?? $this->matricula),
            'formacao' => $this->when($role === 'aluno', [
                'matricula' => $aluno?->matricula ?? $this->matricula,
                'curso' => $curso?->nome,
                'periodo' => $turma?->nome,
                'email' => $this->email,
            ]),
            'progresso' => $this->when($role === 'aluno', [
                'horas_cumpridas' => $aluno?->carga_horaria_cumprida ?? 0,
                'meta_horas' => $curso?->carga_horaria_estagio,
            ]),
            'siape' => $this->when(in_array($role, ['professor', 'diretor'], true), $this->siape),
            'cnpj' => $this->when($role === 'empresa', $this->cnpj),
            'token' => $this->when($isLegacy, $plainToken ?? $request->attributes->get('_token_plain')),
            'usuario' => $this->when($isLegacy, [
                'id' => $this->id,
                'nome' => $this->nome ?? $this->name,
                'email' => $this->email,
                'perfil' => $this->perfil instanceof \BackedEnum ? $this->perfil->value : strtoupper((string) ($this->perfil ?? $role)),
                'status' => $this->status ?? ($this->is_active ? 'ativo' : 'inativo'),
            ]),
        ];
    }
}

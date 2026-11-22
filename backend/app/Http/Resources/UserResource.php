<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class UserResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'email' => $this->email,
            'role' => $this->role,
            'matricula' => $this->when($this->role === 'aluno', $this->matricula),
            'siape' => $this->when(in_array($this->role, ['professor', 'diretor'], true), $this->siape),
            'cnpj' => $this->when($this->role === 'empresa', $this->cnpj),
        ];
    }
}

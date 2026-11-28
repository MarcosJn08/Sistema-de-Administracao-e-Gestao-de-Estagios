<?php

namespace App\Policies;

use App\Models\FrequenciaDiariaCampo;
use App\Models\User;

class FrequenciaCampoPolicy
{
    public function viewAny(User $user): bool
    {
        return in_array($user->role, ['professor', 'diretor'], true);
    }

    public function create(User $user): bool
    {
        return in_array($user->role, ['professor', 'diretor'], true);
    }

    public function viewAluno(User $user, int $alunoId): bool
    {
        if (in_array($user->role, ['professor', 'diretor'], true)) {
            return true;
        }

        if ($user->role === 'aluno') {
            return $user->aluno && $user->aluno->id === $alunoId;
        }

        return false;
    }
}

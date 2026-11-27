<?php

namespace App\Policies;

use App\Models\Estagio;
use App\Models\FrequenciaMensal;
use App\Models\User;

class FrequenciaMensalPolicy
{
    public function view(User $user, Estagio $estagio): bool
    {
        if (in_array($user->role, ['diretor'], true)) {
            return true;
        }

        if ($user->role === 'aluno') {
            return $user->aluno && $estagio->aluno_id === $user->aluno->id;
        }

        if ($user->role === 'professor') {
            return $user->professor && $estagio->professor_orientador_id === $user->professor->id;
        }

        if ($user->role === 'empresa') {
            return $estagio->empresa && $estagio->empresa->usuario_id === $user->id;
        }

        return false;
    }

    public function create(User $user, Estagio $estagio): bool
    {
        if ($user->role === 'diretor') {
            return true;
        }

        if ($user->role === 'aluno') {
            return $user->aluno && $estagio->aluno_id === $user->aluno->id;
        }

        return false;
    }

    public function approve(User $user, FrequenciaMensal $frequenciaMensal): bool
    {
        if ($user->role === 'diretor') {
            return true;
        }

        if ($user->role === 'professor') {
            $estagio = $frequenciaMensal->estagio;
            return $user->professor && $estagio && $estagio->professor_orientador_id === $user->professor->id;
        }

        return false;
    }
}

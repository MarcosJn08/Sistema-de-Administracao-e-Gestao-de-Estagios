<?php

namespace App\Policies;

use App\Models\Curso;
use App\Models\User;
use App\Models\Usuario;

class CursoPolicy
{
    public function viewAny(?User $user): bool
    {
        return true;
    }

    public function view(?User $user, Curso $curso): bool
    {
        return true;
    }

    public function create(User $user): bool
    {
        return $this->isDiretor($user);
    }

    public function update(User $user, Curso $curso): bool
    {
        return $this->isDiretor($user);
    }

    public function delete(User $user, Curso $curso): bool
    {
        return $this->isDiretor($user);
    }

    private function isDiretor(User $user): bool
    {
        $role = strtolower((string) ($user->role ?? ''));
        $perfil = strtoupper((string) ($user->perfil?->value ?? $user->perfil ?? ''));

        return $role === 'diretor' || $perfil === 'DIRETOR';
    }
}

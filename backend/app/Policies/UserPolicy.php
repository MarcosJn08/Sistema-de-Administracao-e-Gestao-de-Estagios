<?php

namespace App\Policies;

use App\Models\User;
use App\Models\Usuario;

class UserPolicy
{
    public function viewAny(User $authUser): bool
    {
        return $authUser->temPerfil('DIRETOR');
    }

    public function view(User $authUser, Usuario $usuario): bool
    {
        return $authUser->temPerfil('DIRETOR') || $authUser->id === $usuario->id;
    }

    public function create(User $authUser): bool
    {
        return $authUser->temPerfil('DIRETOR');
    }

    public function update(User $authUser, Usuario $usuario): bool
    {
        return $authUser->temPerfil('DIRETOR');
    }

    public function delete(User $authUser, Usuario $usuario): bool
    {
        return $authUser->temPerfil('DIRETOR') && $authUser->id !== $usuario->id;
    }
}

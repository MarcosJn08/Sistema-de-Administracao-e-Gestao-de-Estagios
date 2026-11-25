<?php

namespace App\Policies;

use App\Enums\UserRole;
use App\Models\Estagio;
use App\Models\Usuario;

class EstagioPolicy
{
    public function view(Usuario $usuario, Estagio $estagio): bool
    {
        return $usuario->temPerfil(UserRole::DIRETOR)
            || ($usuario->temPerfil(UserRole::ALUNO) && $estagio->aluno->usuario_id === $usuario->id)
            || ($usuario->temPerfil(UserRole::PROFESSOR) && $estagio->orientador->usuario_id === $usuario->id)
            || ($usuario->temPerfil(UserRole::EMPRESA) && $estagio->supervisor->usuario_id === $usuario->id);
    }

    public function submit(Usuario $usuario, Estagio $estagio): bool
    {
        return $usuario->temPerfil(UserRole::DIRETOR) || ($usuario->temPerfil(UserRole::ALUNO) && $this->view($usuario, $estagio));
    }

    public function review(Usuario $usuario, Estagio $estagio): bool
    {
        return $usuario->temPerfil(UserRole::DIRETOR) || ($usuario->temPerfil(UserRole::PROFESSOR) && $this->view($usuario, $estagio));
    }

    public function sign(Usuario $usuario, Estagio $estagio): bool
    {
        return $usuario->temPerfil(UserRole::EMPRESA) && $this->view($usuario, $estagio);
    }

    public function transition(Usuario $usuario, Estagio $estagio): bool
    {
        return $usuario->temPerfil(UserRole::DIRETOR);
    }
}

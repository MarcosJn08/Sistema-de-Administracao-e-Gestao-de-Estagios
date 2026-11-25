<?php

namespace App\Services;

// app/Services/EstagioService.php
class EstagioService
{
    public function criar(array $dados): Estagio
    {
        $empresa = EmpresaConcedente::findOrFail($dados['empresa_concedente_id']);
        $orientador = ProfessorOrientador::findOrFail($dados['professor_orientador_id']);

        if (! $empresa->convenioAtivo()) {
            throw new DomainException('A empresa não possui convênio ativo.');
        }

        if (! $orientador->podeOrientarMais()) {
            throw new DomainException('O professor atingiu o limite de orientados.');
        }

        return Estagio::create($dados + ['status' => 'rascunho']);
    }
}
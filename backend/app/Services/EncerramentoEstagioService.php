<?php

namespace App\Services;

use App\Enums\StatusEstagio;
use App\Events\EstagioCanceladoDesvioFuncaoEvent;
use App\Models\Estagio;
use App\Models\User;

class EncerramentoEstagioService
{
    public function __construct(private readonly EstagioService $estagios) {}

    public function cancelarDesvioFuncao(Estagio $estagio, User $autor, string $parecer): Estagio
    {
        $estagio = $this->estagios->transicionar($estagio, StatusEstagio::CANCELADO_DESVIO_FUNCAO, $autor, $parecer);

        if ($estagio->wasChanged('status')) {
            EstagioCanceladoDesvioFuncaoEvent::dispatch($estagio, $autor);
        }

        return $estagio;
    }

    public function encerrar(Estagio $estagio, User $autor, ?string $motivo): Estagio
    {
        return $this->estagios->transicionar($estagio, StatusEstagio::ENCERRADO, $autor, $motivo);
    }
}

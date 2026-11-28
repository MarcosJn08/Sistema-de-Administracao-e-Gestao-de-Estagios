<?php

namespace App\Listeners;

use App\Events\EstagioCanceladoDesvioFuncaoEvent;
use App\Notifications\EstagioCanceladoDesvioFuncaoNotification;

class NotificarCancelamentoDesvioFuncao
{
    public function handle(EstagioCanceladoDesvioFuncaoEvent $evento): void
    {
        $evento->estagio->aluno->usuario?->notify(new EstagioCanceladoDesvioFuncaoNotification($evento->estagio->id));
    }
}

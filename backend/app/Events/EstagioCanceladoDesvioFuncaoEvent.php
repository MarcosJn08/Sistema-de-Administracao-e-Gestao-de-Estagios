<?php

namespace App\Events;

use App\Models\Estagio;
use App\Models\User;
use Illuminate\Contracts\Events\ShouldDispatchAfterCommit;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class EstagioCanceladoDesvioFuncaoEvent implements ShouldDispatchAfterCommit
{
    use Dispatchable, SerializesModels;

    public function __construct(public readonly Estagio $estagio, public readonly User $autor) {}
}

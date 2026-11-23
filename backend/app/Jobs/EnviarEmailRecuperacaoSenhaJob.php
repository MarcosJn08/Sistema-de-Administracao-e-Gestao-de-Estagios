<?php

namespace App\Jobs;

use App\Mail\RecuperacaoSenhaMail;
use App\Models\User;
use Illuminate\Contracts\Queue\ShouldBeEncrypted;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Password;

class EnviarEmailRecuperacaoSenhaJob implements ShouldBeEncrypted, ShouldQueue
{
    use Queueable;

    public int $tries = 3;

    public int $backoff = 60;

    public bool $deleteWhenMissingModels = true;

    public function __construct(public User $usuario, public string $token) {}

    public function handle(): void
    {
        if (! $this->usuario->canAuthenticate()
            || ! Password::broker('users')->tokenExists($this->usuario, $this->token)) {
            return;
        }

        $parametros = http_build_query([
            'token' => $this->token,
            'email' => $this->usuario->getEmailForPasswordReset(),
        ], '', '&', PHP_QUERY_RFC3986);
        $url = rtrim(config('app.frontend_url'), '/').'/sage/redefinir-senha?'.$parametros;

        Mail::to($this->usuario->getEmailForPasswordReset())->send(new RecuperacaoSenhaMail($url));
    }
}

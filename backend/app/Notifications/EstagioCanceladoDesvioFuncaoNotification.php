<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class EstagioCanceladoDesvioFuncaoNotification extends Notification implements ShouldQueue
{
    use Queueable;

    public function __construct(public readonly int $estagioId) {}

    public function via(object $notifiable): array
    {
        return ['mail'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        return (new MailMessage)
            ->subject('SAGE — Estágio cancelado por desvio de função')
            ->line('Seu estágio foi cancelado após a avaliação pedagógica.')
            ->line('As horas já contabilizadas foram preservadas.')
            ->action('Ver estágio', rtrim(config('app.frontend_url'), '/').'/sage/aluno/estagios/'.$this->estagioId);
    }
}

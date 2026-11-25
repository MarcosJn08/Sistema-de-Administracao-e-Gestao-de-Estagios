<?php

namespace App\Enums;

enum StatusDocumento: string
{
    case PENDENTE = 'PENDENTE';
    case EM_ANALISE = 'EM_ANALISE';
    case DEFERIDO = 'DEFERIDO';
    case NECESSITA_AJUSTES = 'NECESSITA_AJUSTES';
    case EXPIRADO = 'EXPIRADO';

    public function label(): string
    {
        return match ($this) {
            self::PENDENTE          => 'Pendente',
            self::EM_ANALISE        => 'Em análise',
            self::DEFERIDO          => 'Deferido',
            self::NECESSITA_AJUSTES => 'Necessita de ajustes',
            self::EXPIRADO          => 'Expirado',
        };
    }

    public function estaAprovado(): bool
    {
        return $this === self::DEFERIDO;
    }

    // O aluno só pode editar o documento nestes estados
    public function permiteEdicao(): bool
    {
        return in_array($this, [self::PENDENTE, self::NECESSITA_AJUSTES], true);
    }

    public static function values(): array
    {
        return array_column(self::cases(), 'value');
    }
}

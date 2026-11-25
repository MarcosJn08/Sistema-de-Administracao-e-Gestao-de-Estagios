<?php

namespace App\Enums;

enum ModalidadeEstagio: string
{
    case ORIENTADO = 'ORIENTADO';
    case SUPERVISIONADO_CAMPO = 'SUPERVISIONADO_CAMPO';

    public function label(): string
    {
        return match ($this) {
            self::ORIENTADO            => 'Orientado',
            self::SUPERVISIONADO_CAMPO => 'Supervisionado em campo',
        };
    }

    public static function values(): array
    {
        return array_column(self::cases(), 'value');
    }
}

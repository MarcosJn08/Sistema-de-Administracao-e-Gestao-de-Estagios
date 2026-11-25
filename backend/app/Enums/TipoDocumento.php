<?php

namespace App\Enums;

enum TipoDocumento: string
{
    case TCE = 'TCE';
    case PLANO_ATIVIDADES = 'PLANO_ATIVIDADES';
    case FICHA_MATRICULA = 'FICHA_MATRICULA';
    case RELATORIO_PARCIAL = 'RELATORIO_PARCIAL';
    case RELATORIO_FINAL = 'RELATORIO_FINAL';
    case FOLHA_FREQUENCIA = 'FOLHA_FREQUENCIA';

    public function label(): string
    {
        return match ($this) {
            self::TCE               => 'Termo de Compromisso de Estágio',
            self::PLANO_ATIVIDADES  => 'Plano de atividades',
            self::FICHA_MATRICULA   => 'Ficha de matrícula',
            self::RELATORIO_PARCIAL => 'Relatório parcial',
            self::RELATORIO_FINAL   => 'Relatório final',
            self::FOLHA_FREQUENCIA  => 'Folha de frequência',
        };
    }

    public static function values(): array
    {
        return array_column(self::cases(), 'value');
    }
}

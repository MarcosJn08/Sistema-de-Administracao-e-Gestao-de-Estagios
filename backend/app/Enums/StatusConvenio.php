<?php

namespace App\Enums;

enum StatusConvenio: string
{
    case ATIVO = 'ATIVO';
    case PENDENTE_ANALISE = 'PENDENTE_ANALISE';
    case AJUSTES_SOLICITADOS = 'AJUSTES_SOLICITADOS';
    case EXPIRADO = 'EXPIRADO';
    case REJEITADO = 'REJEITADO';

    public function label(): string
    {
        return match ($this) {
            self::ATIVO               => 'Ativo',
            self::PENDENTE_ANALISE    => 'Pendente de análise',
            self::AJUSTES_SOLICITADOS => 'Ajustes solicitados',
            self::EXPIRADO            => 'Expirado',
            self::REJEITADO           => 'Rejeitado',
        };
    }

    // Só convênio ativo permite abrir novos estágios
    public function permiteNovosEstagios(): bool
    {
        return $this === self::ATIVO;
    }

    public static function values(): array
    {
        return array_column(self::cases(), 'value');
    }
}

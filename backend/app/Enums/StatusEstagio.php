<?php

namespace App\Enums;

enum StatusEstagio: string
{
    case EM_ANDAMENTO = 'EM_ANDAMENTO';
    case CONCLUIDO = 'CONCLUIDO';
    case ENCERRADO = 'ENCERRADO';
    case CANCELADO_DESVIO_FUNCAO = 'CANCELADO_DESVIO_FUNCAO';

    public function label(): string
    {
        return match ($this) {
            self::EM_ANDAMENTO            => 'Em andamento',
            self::CONCLUIDO               => 'Concluído',
            self::ENCERRADO               => 'Encerrado',
            self::CANCELADO_DESVIO_FUNCAO => 'Cancelado por desvio de função',
        };
    }

    // Estágio que ainda ocupa uma vaga de orientação do professor
    public function contaNoLimiteDoOrientador(): bool
    {
        return $this === self::EM_ANDAMENTO;
    }

    public function estaFinalizado(): bool
    {
        return $this !== self::EM_ANDAMENTO;
    }

    public static function values(): array
    {
        return array_column(self::cases(), 'value');
    }
}

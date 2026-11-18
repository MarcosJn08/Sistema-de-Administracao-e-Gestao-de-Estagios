<?php

namespace App\Enums;

enum StatusEstagio: string
{
    case EM_ANDAMENTO = 'EM_ANDAMENTO';
    case CONCLUIDO = 'CONCLUIDO';
    case ENCERRADO = 'ENCERRADO';
    case CANCELADO_DESVIO_FUNCAO = 'CANCELADO_DESVIO_FUNCAO';
}

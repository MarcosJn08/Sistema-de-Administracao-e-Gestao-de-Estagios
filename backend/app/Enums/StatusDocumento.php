<?php

namespace App\Enums;

enum StatusDocumento: string
{
    case PENDENTE = 'PENDENTE';
    case EM_ANALISE = 'EM_ANALISE';
    case DEFERIDO = 'DEFERIDO';
    case NECESSITA_AJUSTES = 'NECESSITA_AJUSTES';
    case EXPIRADO = 'EXPIRADO';
}

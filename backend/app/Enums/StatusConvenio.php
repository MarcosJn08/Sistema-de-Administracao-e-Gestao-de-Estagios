<?php

namespace App\Enums;

enum StatusConvenio: string
{
    case ATIVO = 'ATIVO';
    case PENDENTE_ANALISE = 'PENDENTE_ANALISE';
    case AJUSTES_SOLICITADOS = 'AJUSTES_SOLICITADOS';
    case EXPIRADO = 'EXPIRADO';
    case REJEITADO = 'REJEITADO';
}

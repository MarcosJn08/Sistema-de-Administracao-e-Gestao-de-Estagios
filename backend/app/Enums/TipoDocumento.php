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
}

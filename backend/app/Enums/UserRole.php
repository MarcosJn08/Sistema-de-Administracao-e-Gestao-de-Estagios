<?php

namespace App\Enums;

enum UserRole: string
{
    case ALUNO = 'ALUNO';
    case EMPRESA = 'EMPRESA';
    case PROFESSOR = 'PROFESSOR';
    case DIRETOR = 'DIRETOR';
}

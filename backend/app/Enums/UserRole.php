<?php

namespace App\Enums;

enum UserRole: string
{
    case ALUNO = 'ALUNO';
    case EMPRESA = 'EMPRESA';
    case PROFESSOR = 'PROFESSOR';
    case DIRETOR = 'DIRETOR';

    public function label(): string
    {
        return match ($this) {
            self::ALUNO     => 'Aluno',
            self::EMPRESA   => 'Empresa concedente',
            self::PROFESSOR => 'Professor orientador',
            self::DIRETOR   => 'Diretor',
        };
    }

    public static function values(): array
    {
        return array_column(self::cases(), 'value');
    }
}

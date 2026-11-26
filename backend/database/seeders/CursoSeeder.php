<?php

namespace Database\Seeders;

use App\Models\Curso;
use Illuminate\Database\Seeder;

class CursoSeeder extends Seeder
{
    public function run(): void
    {
        $cursos = [
            [
                'codigo' => 'ADS',
                'nome' => 'Tecnologia em Análise e Desenvolvimento de Sistemas',
                'modalidade' => 'superior',
                'carga_horaria_estagio' => 200,
                'horas_minimas_estagio' => 200,
                'permite_aproveitamento_projetos' => true,
                'modalidade_estagio' => 'orientado',
                'status' => 'ativo',
            ],
            [
                'codigo' => 'PG',
                'nome' => 'Tecnologia em Processos Gerenciais',
                'modalidade' => 'superior',
                'carga_horaria_estagio' => 200,
                'horas_minimas_estagio' => 200,
                'permite_aproveitamento_projetos' => true,
                'modalidade_estagio' => 'orientado',
                'status' => 'ativo',
            ],
            [
                'codigo' => 'ENF',
                'nome' => 'Técnico em Enfermagem',
                'modalidade' => 'tecnico',
                'carga_horaria_estagio' => 160,
                'horas_minimas_estagio' => 160,
                'permite_aproveitamento_projetos' => false,
                'modalidade_estagio' => 'supervisionado_campo',
                'status' => 'ativo',
            ],
            [
                'codigo' => 'INFO',
                'nome' => 'Técnico em Informática',
                'modalidade' => 'tecnico_integrado',
                'carga_horaria_estagio' => 160,
                'horas_minimas_estagio' => 160,
                'permite_aproveitamento_projetos' => false,
                'modalidade_estagio' => 'supervisionado_campo',
                'status' => 'ativo',
            ],
            [
                'codigo' => 'ADM',
                'nome' => 'Técnico em Administração',
                'modalidade' => 'tecnico_integrado',
                'carga_horaria_estagio' => 160,
                'horas_minimas_estagio' => 160,
                'permite_aproveitamento_projetos' => false,
                'modalidade_estagio' => 'supervisionado_campo',
                'status' => 'ativo',
            ],
            [
                'codigo' => 'AGRO',
                'nome' => 'Técnico em Agropecuária',
                'modalidade' => 'tecnico_integrado',
                'carga_horaria_estagio' => 160,
                'horas_minimas_estagio' => 160,
                'permite_aproveitamento_projetos' => false,
                'modalidade_estagio' => 'supervisionado_campo',
                'status' => 'ativo',
            ],
            [
                'codigo' => 'ZOO',
                'nome' => 'Técnico em Zootecnia',
                'modalidade' => 'tecnico_integrado',
                'carga_horaria_estagio' => 160,
                'horas_minimas_estagio' => 160,
                'permite_aproveitamento_projetos' => false,
                'modalidade_estagio' => 'supervisionado_campo',
                'status' => 'ativo',
            ],
            [
                'codigo' => 'ENGA',
                'nome' => 'Bacharelado em Engenharia Agronômica',
                'modalidade' => 'superior',
                'carga_horaria_estagio' => 300,
                'horas_minimas_estagio' => 300,
                'permite_aproveitamento_projetos' => true,
                'modalidade_estagio' => 'orientado',
                'status' => 'ativo',
            ],
        ];

        foreach ($cursos as $dados) {
            $cursoExistente = Curso::where('codigo', $dados['codigo'])
                ->orWhere('nome', $dados['nome'])
                ->first();

            if ($cursoExistente) {
                $cursoExistente->update($dados);
            } else {
                Curso::create($dados);
            }
        }
    }
}

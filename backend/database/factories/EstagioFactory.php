<?php

namespace Database\Factories;

use App\Models\Aluno;
use App\Models\Estagio;
use App\Models\ProfessorOrientador;
use App\Models\SupervisorEmpresa;
use App\Models\Turma;
use Illuminate\Database\Eloquent\Factories\Factory;

class EstagioFactory extends Factory
{
    protected $model = Estagio::class;

    public function definition(): array
    {
        return [
            'aluno_id' => Aluno::factory()->state(['turma_id' => Turma::factory(), 'curso_nome' => null]),
            'curso_id' => fn (array $attributes) => Aluno::findOrFail($attributes['aluno_id'])->turma->curso_id,
            'supervisor_empresa_id' => SupervisorEmpresa::factory(),
            'empresa_concedente_id' => fn (array $attributes) => SupervisorEmpresa::findOrFail($attributes['supervisor_empresa_id'])->empresa_concedente_id,
            'professor_orientador_id' => ProfessorOrientador::factory(),
            'cargo' => 'Estagiário de desenvolvimento de sistemas',
            'modalidade' => 'ORIENTADO',
            'data_inicio' => today()->toDateString(),
            'data_termino' => today()->addMonthsNoOverflow(6)->toDateString(),
            'carga_horaria_diaria' => 4,
            'carga_horaria_semanal' => 20,
            'meta_horas_tce' => 400,
            'bolsa_auxilio' => 800,
            'status' => 'RASCUNHO',
            'encerrado_em' => null,
            'motivo_encerramento' => null,
        ];
    }

    public function trintaHoras(): static
    {
        return $this->state(['carga_horaria_diaria' => 6, 'carga_horaria_semanal' => 30]);
    }
}

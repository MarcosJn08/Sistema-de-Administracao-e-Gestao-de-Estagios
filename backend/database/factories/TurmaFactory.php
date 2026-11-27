<?php

namespace Database\Factories;

use App\Models\Curso;
use App\Models\Turma;
use Illuminate\Database\Eloquent\Factories\Factory;

class TurmaFactory extends Factory
{
    protected $model = Turma::class;

    public function definition(): array
    {
        return ['curso_id' => Curso::factory(), 'nome' => 'Turma de estágio', 'ano' => now()->year, 'semestre' => 1, 'turno' => 'noturno', 'status' => 'ativa'];
    }
}

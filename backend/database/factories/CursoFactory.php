<?php

namespace Database\Factories;

use App\Models\Curso;
use Illuminate\Database\Eloquent\Factories\Factory;

class CursoFactory extends Factory
{
    protected $model = Curso::class;

    public function definition(): array
    {
        return ['nome' => fake()->unique()->words(3, true), 'codigo' => fake()->unique()->bothify('CUR-####??'), 'carga_horaria_estagio' => 400, 'status' => 'ativo'];
    }
}

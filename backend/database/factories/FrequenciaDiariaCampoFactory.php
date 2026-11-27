<?php

namespace Database\Factories;

use App\Models\Aluno;
use App\Models\Estagio;
use App\Models\FrequenciaDiariaCampo;
use App\Models\ProfessorOrientador;
use Illuminate\Database\Eloquent\Factories\Factory;

class FrequenciaDiariaCampoFactory extends Factory
{
    protected $model = FrequenciaDiariaCampo::class;

    public function definition(): array
    {
        $presente = fake()->boolean(85);

        return [
            'estagio_id'      => Estagio::factory(),
            'aluno_id'        => fn (array $attr) => Estagio::findOrFail($attr['estagio_id'])->aluno_id,
            'professor_id'    => ProfessorOrientador::factory(),
            'data'            => fake()->dateTimeBetween('-60 days', 'yesterday')->format('Y-m-d'),
            'presente'        => $presente,
            'horas_cumpridas' => $presente ? fake()->randomFloat(1, 1, 6) : 0,
            'observacoes'     => fake()->optional(0.2)->sentence(),
        ];
    }

    public function presente(): static
    {
        return $this->state(['presente' => true, 'horas_cumpridas' => 6.0]);
    }

    public function falta(): static
    {
        return $this->state(['presente' => false, 'horas_cumpridas' => 0, 'observacoes' => 'Falta justificada']);
    }

    public function naData(string $data): static
    {
        return $this->state(['data' => $data]);
    }
}

<?php

namespace Database\Factories;

use App\Models\ProfessorOrientador;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

class ProfessorOrientadorFactory extends Factory
{
    protected $model = ProfessorOrientador::class;

    public function definition(): array
    {
        $siape = fake()->unique()->numerify('#######');
        $cpf = fake()->unique()->numerify('###########');
        $departamento = fake()->randomElement(['Informática', 'Ciências Agrárias', 'Gestão e Negócios', 'Engenharia']);

        return [
            'usuario_id' => User::factory()->professor()->state([
                'siape' => $siape,
                'cpf' => $cpf,
            ]),
            'siape_matricula' => $siape,
            'departamento_area' => $departamento,
            'titulacao' => fake()->randomElement(['Especialista', 'Mestre', 'Doutor']),
            'telefone' => fake()->phoneNumber(),
            'area_atuacao' => $departamento,
            'regime_trabalho' => fake()->randomElement(['Dedicação exclusiva', '40 horas', '20 horas']),
            'max_orientados' => fake()->numberBetween(3, 8),
        ];
    }
}

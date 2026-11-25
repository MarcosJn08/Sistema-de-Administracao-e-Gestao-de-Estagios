<?php

namespace Database\Factories;

use App\Models\Aluno;
use App\Models\Turma;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

class AlunoFactory extends Factory
{
    protected $model = Aluno::class;

    public function definition(): array
    {
        $matricula = fake()->unique()->numerify('2026########');
        $cpf = fake()->unique()->numerify('###########');

        return [
            'usuario_id' => User::factory()->state([
                'role' => 'aluno',
                'matricula' => $matricula,
                'cpf' => $cpf,
            ]),
            'turma_id' => Turma::query()->inRandomOrder()->value('id'),
            'matricula' => $matricula,
            'cpf' => $cpf,
            'telefone' => fake()->phoneNumber(),
            'curso_nome' => fake()->randomElement(['Sistemas de Informação', 'Engenharia Agronômica', 'Administração']),
        ];
    }
}

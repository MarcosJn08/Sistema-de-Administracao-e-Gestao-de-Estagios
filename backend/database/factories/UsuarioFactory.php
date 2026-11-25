<?php

namespace Database\Factories;

use App\Enums\UserRole;
use App\Models\Usuario;
use Illuminate\Database\Eloquent\Factories\Factory;

class UsuarioFactory extends Factory
{
    protected $model = Usuario::class;

    public function definition(): array
    {
        return [
            'nome' => fake()->name(),
            'email' => fake()->unique()->userName().'@sage.test',
            'password' => 'SenhaDeTeste123!',
            'perfil' => UserRole::ALUNO,
            'status' => 'ativo',
        ];
    }
}

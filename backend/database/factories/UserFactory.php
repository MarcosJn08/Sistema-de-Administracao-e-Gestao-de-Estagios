<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class UserFactory extends Factory
{
    protected static ?string $password;

    public function definition(): array
    {
        return [
            'name' => fake()->name(),
            'email' => fake()->unique()->userName().'@aluno.ifnmg.edu.br',
            'role' => 'aluno',
            'matricula' => fake()->unique()->numerify('2026########'),
            'cpf' => fake()->unique()->numerify('###########'),
            'is_active' => true,
            'email_verified_at' => now(),
            'password' => static::$password ??= Hash::make('password'),
            'remember_token' => Str::random(10),
        ];
    }

    public function unverified(): static
    {
        return $this->state(fn (array $attributes) => [
            'email_verified_at' => null,
        ]);
    }

    public function professor(): static
    {
        return $this->state(fn (): array => [
            'role' => 'professor',
            'email' => fake()->unique()->userName().'@ifnmg.edu.br',
            'matricula' => null,
            'siape' => fake()->unique()->numerify('#######'),
        ]);
    }

    public function diretor(): static
    {
        return $this->professor()->state(['role' => 'diretor']);
    }

    public function empresa(): static
    {
        return $this->state(fn (): array => [
            'role' => 'empresa',
            'email' => fake()->unique()->companyEmail(),
            'matricula' => null,
            'cnpj' => fake()->unique()->numerify('##############'),
        ]);
    }
}

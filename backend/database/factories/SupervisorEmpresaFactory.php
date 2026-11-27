<?php

namespace Database\Factories;

use App\Models\EmpresaConcedente;
use App\Models\SupervisorEmpresa;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

class SupervisorEmpresaFactory extends Factory
{
    protected $model = SupervisorEmpresa::class;

    public function definition(): array
    {
        return ['empresa_concedente_id' => EmpresaConcedente::factory(), 'usuario_id' => User::factory()->empresa(), 'nome' => fake()->name(), 'cargo' => 'Supervisor de desenvolvimento', 'formacao' => 'Sistemas de Informação', 'telefone' => '38999990000', 'email' => fn (array $attributes) => User::findOrFail($attributes['usuario_id'])->email];
    }
}

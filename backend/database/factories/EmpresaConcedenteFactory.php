<?php

namespace Database\Factories;

use App\Models\EmpresaConcedente;
use Illuminate\Database\Eloquent\Factories\Factory;

class EmpresaConcedenteFactory extends Factory
{
    protected $model = EmpresaConcedente::class;

    public function definition(): array
    {
        return ['cnpj' => fake()->unique()->numerify('##############'), 'razao_social' => fake()->company(), 'endereco_completo' => fake()->address(), 'representante_legal' => fake()->name(), 'status_convenio' => 'ATIVO'];
    }
}

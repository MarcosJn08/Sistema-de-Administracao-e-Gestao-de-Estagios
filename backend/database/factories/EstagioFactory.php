<?php

namespace Database\Factories;

use App\Enums\ModalidadeEstagio;
use App\Enums\StatusEstagio;
use App\Models\Estagio;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Estagio>
 */
class EstagioFactory extends Factory
{
    protected $model = Estagio::class;

    public function definition(): array
    {
        $inicio = today();

        return [
            'professor_orientador_id' => null,
            'modalidade' => ModalidadeEstagio::ORIENTADO,
            'data_inicio' => $inicio->toDateString(),
            'data_termino' => $inicio->copy()->addMonths(3)->toDateString(),
            'carga_horaria_diaria' => 6,
            'status' => StatusEstagio::RASCUNHO,
        ];
    }
}

<?php

namespace Database\Seeders;

use App\Models\ProfessorOrientador;
use Illuminate\Database\Seeder;

class ProfessorOrientadorSeeder extends Seeder
{
    public function run(): void
    {
        ProfessorOrientador::factory()->count(5)->create();
    }
}

<?php

namespace Database\Seeders;

use App\Models\Curso;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        if (! app()->environment(['local', 'testing'])) {
            return;
        }
        $curso = Curso::firstOrCreate(['codigo' => 'SI'], ['nome' => 'Sistemas de Informação', 'carga_horaria_estagio' => 400]);
        $curso->turmas()->firstOrCreate(['nome' => 'SI 2026.1', 'ano' => 2026, 'semestre' => 1], ['turno' => 'noturno']);

        $this->call([
            UsuarioSeeder::class,
            AlunoSeeder::class,
            ProfessorOrientadorSeeder::class,
            EstagioSeeder::class,
        ]);

        if (app()->environment('local') && ! app()->runningUnitTests()) {
            $this->call([
                FrequenciaCampoSeeder::class,
            ]);
        }
    }
}

<?php

namespace Database\Seeders;

use App\Enums\StatusConvenio;
use App\Models\Curso;
use App\Models\EmpresaConcedente;
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
        EmpresaConcedente::firstOrCreate(['cnpj' => '12345678000190'], ['razao_social' => 'Empresa de demonstração', 'endereco_completo' => 'Endereço de demonstração', 'representante_legal' => 'Representante de demonstração', 'status_convenio' => StatusConvenio::ATIVO]);

        $this->call([
            CursoSeeder::class,
            UsuarioSeeder::class,
            AlunoSeeder::class,
            ProfessorOrientadorSeeder::class,
        ]);
    }
}

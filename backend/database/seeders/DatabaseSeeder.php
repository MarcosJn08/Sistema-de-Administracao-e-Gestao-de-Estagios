<?php

namespace Database\Seeders;

use App\Enums\StatusConvenio;
use App\Enums\UserRole;
use App\Models\Curso;
use App\Models\EmpresaConcedente;
use App\Models\Usuario;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    public function run(): void
    {
        Usuario::create([
            'nome' => 'Administrador',
            'email' => 'admin@sage.test',
            'password' => 'admin123', // o cast 'hashed' do Model já criptografa
            'perfil' => UserRole::DIRETOR,
        ]);

        $curso = Curso::create([
            'nome' => 'Sistemas de Informação',
            'codigo' => 'SI',
            'carga_horaria_estagio' => 400,
        ]);

        $curso->turmas()->create([
            'nome' => 'SI 2026.1',
            'ano' => 2026,
            'semestre' => 1,
            'turno' => 'noturno',
        ]);

        EmpresaConcedente::create([
            'cnpj' => '12.345.678/0001-90',
            'razao_social' => 'Tech Ltda',
            'endereco_completo' => 'Rua A, 10, Centro, Felisburgo/MG',
            'representante_legal' => 'João Souza',
            'status_convenio' => StatusConvenio::ATIVO,
        ]);
    }
}

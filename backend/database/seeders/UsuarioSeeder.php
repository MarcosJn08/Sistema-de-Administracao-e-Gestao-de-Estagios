<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;

class UsuarioSeeder extends Seeder
{
    public function run(): void
    {
        if (! User::where('role', 'diretor')->exists()) {
            User::factory()->diretor()->create([
                'name' => 'Diretor Geral',
                'email' => 'diretor@ifnmg.edu.br',
                'siape' => '1000001',
                'password' => 'password123',
            ]);
        }

        if (! User::where('role', 'empresa')->exists()) {
            User::factory()->empresa()->create([
                'name' => 'Tech Inovações LTDA',
                'email' => 'contato@techinovacoes.com.br',
                'cnpj' => '11222333000181',
                'password' => 'password123',
            ]);
        }
    }
}

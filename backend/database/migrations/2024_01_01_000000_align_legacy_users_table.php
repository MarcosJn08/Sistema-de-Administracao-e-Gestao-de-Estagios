<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (Schema::hasTable('usuarios')) {
            return;
        }

        foreach (['nome', 'perfil', 'status'] as $column) {
            if (Schema::hasColumn('users', $column)) {
                continue;
            }

            Schema::table('users', function (Blueprint $table) use ($column): void {
                match ($column) {
                    'nome' => $table->string('nome')->nullable(),
                    'perfil' => $table->string('perfil', 20)->default('ALUNO'),
                    'status' => $table->enum('status', ['ativo', 'inativo'])->default('ativo'),
                };
            });
        }

        $dados = ['nome' => DB::raw('name')];

        if (Schema::hasColumn('users', 'role')) {
            $dados['perfil'] = DB::raw("CASE WHEN role IN ('aluno', 'professor', 'diretor', 'empresa') THEN UPPER(role) ELSE 'ALUNO' END");
        }

        if (Schema::hasColumn('users', 'is_active')) {
            $dados['status'] = DB::raw("CASE WHEN is_active THEN 'ativo' ELSE 'inativo' END");
        }

        DB::table('users')->update($dados);

        Schema::rename('users', 'usuarios');
    }

    public function down(): void
    {
        // A tabela unificada pertence à migração base e é usada pelos vínculos da PR #44.
    }
};

<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('alunos', function (Blueprint $table) {
            $table->json('dados_perfil')->nullable();
        });
        Schema::table('documentos', function (Blueprint $table) {
            $table->foreignId('estagio_id')->nullable()->change();
            $table->foreignId('aluno_id')->nullable()->after('estagio_id')->constrained('alunos')->cascadeOnDelete();
            $table->index(['aluno_id', 'tipo']);
        });
    }

    public function down(): void
    {
        Schema::table('documentos', function (Blueprint $table) {
            $table->dropForeign(['aluno_id']);
            $table->dropIndex(['aluno_id', 'tipo']);
            $table->dropColumn('aluno_id');
            $table->foreignId('estagio_id')->nullable(false)->change();
        });
        Schema::table('alunos', fn (Blueprint $table) => $table->dropColumn('dados_perfil'));
    }
};

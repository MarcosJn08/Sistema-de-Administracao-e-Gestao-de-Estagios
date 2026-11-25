<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('alunos', function (Blueprint $table) {
            $table->id();
            $table->foreignId('usuario_id')->constrained('usuarios')->cascadeOnDelete();
            $table->foreignId('turma_id')->nullable()->constrained('turmas');
            $table->string('matricula')->unique();
            $table->string('cpf', 14)->unique();
            $table->string('telefone')->nullable();
            $table->string('curso_nome')->nullable();
            $table->unsignedInteger('carga_horaria_cumprida')->default(0);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('alunos');
    }
};
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('candidaturas_vaga', function (Blueprint $table) {
            $table->id();
            $table->foreignId('aluno_id')->constrained('alunos')->cascadeOnDelete();
            $table->string('vaga_id', 80);
            $table->string('vaga', 255);
            $table->string('empresa', 255);
            $table->text('carta_apresentacao');
            $table->string('status', 30)->default('EM_ANALISE');
            $table->timestamps();
            $table->unique(['aluno_id', 'vaga_id']);
        });
    }
    public function down(): void { Schema::dropIfExists('candidaturas_vaga'); }
};

<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('turmas', function (Blueprint $table) {
    $table->id();
    $table->foreignId('curso_id')->constrained('cursos');
    $table->string('nome');                 // ex.: "SI 2024.1 - Noturno"
    $table->unsignedSmallInteger('ano');
    $table->unsignedTinyInteger('semestre'); // 1 ou 2
    $table->enum('turno', ['matutino', 'vespertino', 'noturno'])->nullable();
    $table->enum('status', ['ativa', 'encerrada'])->default('ativa');
    $table->timestamps();

    $table->unique(['curso_id', 'ano', 'semestre', 'nome']);
});
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('turmas');
    }
};

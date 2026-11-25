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
        Schema::create('relatorios_estagio', function (Blueprint $table) {
    $table->id();
    $table->foreignId('estagio_id')->constrained()->cascadeOnDelete();
    $table->text('resumo_atividades');
    $table->text('relacao_teoria_pratica');
    $table->text('dificuldades')->nullable();
    $table->boolean('aprovado')->default(false);
    $table->timestamps();
});
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('relatorios_estagio');
    }
};

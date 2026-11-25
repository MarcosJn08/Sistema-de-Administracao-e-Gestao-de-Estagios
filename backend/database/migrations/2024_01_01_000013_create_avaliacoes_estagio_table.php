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
        Schema::create('avaliacoes_estagio', function (Blueprint $table) {
    $table->id();
    $table->foreignId('estagio_id')->constrained()->cascadeOnDelete();
    $table->enum('tipo', ['concedente', 'estagiario']); // quem está avaliando
    $table->decimal('nota_desempenho', 4, 2)->nullable();
    $table->string('conceito_atitude')->nullable();
    $table->text('auto_avaliacao')->nullable();
    $table->text('parecer_final')->nullable();
    $table->timestamps();
});
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('avaliacoes_estagio');
    }
};

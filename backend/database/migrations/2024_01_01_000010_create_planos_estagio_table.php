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
        Schema::create('planos_estagio', function (Blueprint $table) {
    $table->id();
    $table->foreignId('estagio_id')->constrained()->cascadeOnDelete();
    $table->text('objetivos');
    $table->text('atividades_previstas');
    $table->text('cronograma');
    $table->text('parecer_orientador')->nullable();
    $table->timestamps();
});
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('planos_estagio');
    }
};

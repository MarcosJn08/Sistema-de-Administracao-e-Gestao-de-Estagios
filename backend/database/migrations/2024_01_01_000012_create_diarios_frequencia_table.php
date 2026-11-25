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
        Schema::create('diarios_frequencia', function (Blueprint $table) {
    $table->id();
    $table->foreignId('estagio_id')->constrained()->cascadeOnDelete();
    $table->date('data');
    $table->time('hora_entrada');
    $table->time('hora_saida');
    $table->decimal('horas_diarias', 4, 2);
    $table->boolean('assinado_supervisor')->default(false);
    $table->timestamps();

    $table->unique(['estagio_id', 'data']); // um registro por dia
});
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('diarios_frequencia');
    }
};

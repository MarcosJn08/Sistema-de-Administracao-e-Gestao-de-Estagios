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
        Schema::create('declaracoes_salubridade', function (Blueprint $table) {
    $table->id();
    $table->foreignId('estagio_id')->constrained()->cascadeOnDelete();
    $table->string('local_estagio');
    $table->text('condicoes_higiene');
    $table->boolean('possui_epi')->default(false);
    $table->text('riscos_ocupacionais')->nullable();
    $table->timestamps();
});
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('declaracoes_salubridade');
    }
};

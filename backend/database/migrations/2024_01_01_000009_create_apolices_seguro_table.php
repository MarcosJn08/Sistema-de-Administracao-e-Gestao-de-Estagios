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
        Schema::create('apolices_seguro', function (Blueprint $table) {
    $table->id();
    $table->foreignId('estagio_id')->constrained()->cascadeOnDelete();
    $table->string('numero_apolice');
    $table->string('nome_seguradora');
    $table->timestamps();
});
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('apolices_seguro');
    }
};

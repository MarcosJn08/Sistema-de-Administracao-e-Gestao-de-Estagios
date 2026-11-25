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
        Schema::create('supervisores_empresa', function (Blueprint $table) {
    $table->id();
    $table->foreignId('empresa_concedente_id')->constrained('empresas_concedentes')->cascadeOnDelete();
    $table->foreignId('usuario_id')->nullable()->constrained('usuarios')->nullOnDelete();
    $table->string('nome');
    $table->string('cargo');
    $table->string('formacao');
    $table->string('telefone', 20);
    $table->string('email');
    $table->timestamps();
});
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('supervisores_empresa');
    }
};

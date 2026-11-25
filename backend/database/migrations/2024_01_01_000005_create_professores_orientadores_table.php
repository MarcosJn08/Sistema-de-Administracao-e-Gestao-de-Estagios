<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('professores_orientadores', function (Blueprint $table) {
            $table->id();
            $table->foreignId('usuario_id')->constrained('usuarios')->cascadeOnDelete();
            $table->string('siape_matricula')->unique();
            $table->string('departamento_area');
            $table->string('titulacao')->nullable();
            $table->string('telefone')->nullable();
            $table->string('area_atuacao')->nullable();
            $table->string('regime_trabalho')->nullable();
            $table->unsignedInteger('max_orientados')->default(5);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('professores_orientadores');
    }
};
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('documentos', function (Blueprint $table) {
            $table->id();
            $table->foreignId('estagio_id')->constrained()->cascadeOnDelete();
            $table->string('tipo', 30);                              // App\Enums\TipoDocumento
            $table->string('status', 30)->default('PENDENTE');      // App\Enums\StatusDocumento
            $table->text('observacoes')->nullable();                 // motivo dos ajustes solicitados
            $table->timestamps();

            $table->index(['estagio_id', 'tipo']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('documentos');
    }
};

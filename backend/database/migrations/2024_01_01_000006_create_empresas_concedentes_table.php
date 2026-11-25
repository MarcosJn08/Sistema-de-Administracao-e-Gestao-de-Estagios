<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('empresas_concedentes', function (Blueprint $table) {
            $table->id();
            $table->string('cnpj', 18)->unique();
            $table->string('razao_social');
            $table->string('endereco_completo');
            $table->string('representante_legal');
            $table->string('status_convenio', 30)->default('PENDENTE_ANALISE'); // App\Enums\StatusConvenio
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('empresas_concedentes');
    }
};

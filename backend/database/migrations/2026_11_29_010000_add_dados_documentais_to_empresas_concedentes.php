<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('empresas_concedentes', function (Blueprint $table) {
            $table->string('cidade', 100)->nullable();
            $table->string('uf', 2)->nullable();
            $table->string('cep', 9)->nullable();
            $table->string('telefone', 30)->nullable();
            $table->string('fax', 30)->nullable();
            $table->string('email', 255)->nullable();
            $table->string('cargo_representante', 100)->nullable();
            $table->string('numero', 30)->nullable();
            $table->string('bairro', 100)->nullable();
            $table->string('numero_registro', 100)->nullable();
            $table->string('conselho_fiscalizacao', 100)->nullable();
        });
    }

    public function down(): void
    {
        Schema::table('empresas_concedentes', function (Blueprint $table) {
            $table->dropColumn(['cidade', 'uf', 'cep', 'telefone', 'fax', 'email', 'cargo_representante', 'numero', 'bairro', 'numero_registro', 'conselho_fiscalizacao']);
        });
    }
};

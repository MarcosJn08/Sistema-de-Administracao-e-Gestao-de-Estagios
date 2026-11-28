<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('frequencias_diarias_campo', function (Blueprint $table) {
            $table->id();
            $table->foreignId('estagio_id')->constrained('estagios')->cascadeOnDelete();
            $table->foreignId('aluno_id')->constrained('alunos')->cascadeOnDelete();
            $table->foreignId('professor_id')->constrained('professores_orientadores')->cascadeOnDelete();
            $table->date('data');
            $table->decimal('horas_cumpridas', 4, 2)->default(0);
            $table->boolean('presente')->default(true);
            $table->text('observacoes')->nullable();
            $table->timestamps();

            $table->unique(['estagio_id', 'data'], 'freq_campo_estagio_data_unique');
        });

        Schema::create('frequencias_mensais', function (Blueprint $table) {
            $table->id();
            $table->foreignId('estagio_id')->constrained('estagios')->cascadeOnDelete();
            $table->unsignedTinyInteger('mes_competencia');
            $table->unsignedSmallInteger('ano_competencia');
            $table->decimal('total_horas_mes', 5, 2);
            $table->string('arquivo_path');
            $table->string('status', 30)->default('PENDENTE');
            $table->foreignId('validado_por')->nullable()->constrained('professores_orientadores')->nullOnDelete();
            $table->timestamp('validado_em')->nullable();
            $table->timestamps();

            $table->unique(['estagio_id', 'mes_competencia', 'ano_competencia'], 'freq_mensal_estagio_mes_ano_unique');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('frequencias_mensais');
        Schema::dropIfExists('frequencias_diarias_campo');
    }
};

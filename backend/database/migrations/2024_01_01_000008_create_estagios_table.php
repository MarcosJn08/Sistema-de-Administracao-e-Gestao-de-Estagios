<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('estagios', function (Blueprint $table) {
            $table->id();
            $table->foreignId('aluno_id')->constrained('alunos');
            $table->foreignId('empresa_concedente_id')->constrained('empresas_concedentes');
            $table->foreignId('professor_orientador_id')->constrained('professores_orientadores');
            $table->foreignId('supervisor_empresa_id')->constrained('supervisores_empresa');
            $table->string('modalidade', 30);                          // App\Enums\ModalidadeEstagio
            $table->date('data_inicio');
            $table->date('data_termino');
            $table->decimal('carga_horaria_diaria', 4, 2);
            $table->decimal('bolsa_auxilio', 10, 2)->nullable();
            $table->string('status', 30)->default('EM_ANDAMENTO');    // App\Enums\StatusEstagio
            $table->timestamps();

            $table->index('status');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('estagios');
    }
};

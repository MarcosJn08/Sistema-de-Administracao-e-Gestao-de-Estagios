<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('cursos', function (Blueprint $table) {
            $table->string('modalidade', 100)->nullable()->after('codigo');
            $table->unsignedInteger('horas_minimas_estagio')->nullable()->after('carga_horaria_estagio');
            $table->boolean('permite_aproveitamento_projetos')->default(false)->after('horas_minimas_estagio');
            $table->string('modalidade_estagio', 50)->default('orientado')->after('permite_aproveitamento_projetos');
            $table->softDeletes()->after('status');
        });
    }

    public function down(): void
    {
        Schema::table('cursos', function (Blueprint $table) {
            $table->dropSoftDeletes();
            $table->dropColumn([
                'modalidade',
                'horas_minimas_estagio',
                'permite_aproveitamento_projetos',
                'modalidade_estagio',
            ]);
        });
    }
};

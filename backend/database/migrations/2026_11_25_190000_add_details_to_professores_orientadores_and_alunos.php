<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('professores_orientadores', function (Blueprint $table) {
            if (! Schema::hasColumn('professores_orientadores', 'titulacao')) {
                $table->string('titulacao')->nullable()->after('departamento_area');
            }
            if (! Schema::hasColumn('professores_orientadores', 'telefone')) {
                $table->string('telefone')->nullable()->after('titulacao');
            }
            if (! Schema::hasColumn('professores_orientadores', 'area_atuacao')) {
                $table->string('area_atuacao')->nullable()->after('telefone');
            }
            if (! Schema::hasColumn('professores_orientadores', 'regime_trabalho')) {
                $table->string('regime_trabalho')->nullable()->after('area_atuacao');
            }
        });

        Schema::table('alunos', function (Blueprint $table) {
            if (! Schema::hasColumn('alunos', 'telefone')) {
                $table->string('telefone')->nullable()->after('cpf');
            }
            if (! Schema::hasColumn('alunos', 'curso_nome')) {
                $table->string('curso_nome')->nullable()->after('telefone');
            }
        });
    }

    public function down(): void
    {
        Schema::table('professores_orientadores', function (Blueprint $table) {
            $table->dropColumn(['titulacao', 'telefone', 'area_atuacao', 'regime_trabalho']);
        });

        Schema::table('alunos', function (Blueprint $table) {
            $table->dropColumn(['telefone', 'curso_nome']);
        });
    }
};

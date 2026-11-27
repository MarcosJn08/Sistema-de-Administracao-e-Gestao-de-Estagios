<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Instalações antigas executaram a migration contratual antes da inclusão do curso.
        if (! Schema::hasColumn('estagios', 'curso_id')) {
            Schema::table('estagios', function (Blueprint $table) {
                $table->foreignId('curso_id')->nullable()->constrained('cursos')->restrictOnDelete();
            });
        }
    }

    public function down(): void
    {
        // Preserva a coluna: ela também pertence à migration contratual original.
        // O rollback daquela migration é responsável por removê-la.
    }
};

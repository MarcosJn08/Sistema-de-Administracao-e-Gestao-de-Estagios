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
        Schema::table('estagios', function (Blueprint $table) {
            $table->string('cargo')->nullable();
            $table->decimal('carga_horaria_semanal', 5, 2)->nullable();
            $table->decimal('meta_horas_tce', 8, 2)->nullable();
            $table->timestamp('encerrado_em')->nullable();
            $table->text('motivo_encerramento')->nullable();
            $table->foreignId('curso_id')
                ->nullable()
                ->constrained('cursos')
                ->restrictOnDelete();
        });
    }

    public function down(): void
    {
        Schema::table('estagios', function (Blueprint $table) {
            $table->dropConstrainedForeignId('curso_id');
            $table->dropColumn([
                'cargo',
                'carga_horaria_semanal',
                'meta_horas_tce',
                'encerrado_em',
                'motivo_encerramento',
            ]);
        });
    }
};

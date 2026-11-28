<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        $missing = array_diff([
            'arquivo_path', 'arquivo_nome', 'arquivo_mime', 'arquivo_tamanho',
            'enviado_por', 'analisado_por', 'analisado_em',
        ], Schema::getColumnListing('documentos'));

        if ($missing !== []) {
            Schema::table('documentos', function (Blueprint $table) use ($missing): void {
                foreach ($missing as $column) {
                    match ($column) {
                        'arquivo_mime' => $table->string($column, 100)->nullable(),
                        'arquivo_tamanho' => $table->unsignedBigInteger($column)->nullable(),
                        'enviado_por', 'analisado_por' => $table->foreignId($column)->nullable()->constrained('usuarios')->nullOnDelete(),
                        'analisado_em' => $table->timestamp($column)->nullable(),
                        default => $table->string($column)->nullable(),
                    };
                }
            });
        }

        if (! Schema::hasTable('historico_documentos')) {
            Schema::create('historico_documentos', function (Blueprint $table): void {
                $table->id();
                $table->foreignId('documento_id')->constrained('documentos')->restrictOnDelete();
                $table->foreignId('usuario_id')->nullable()->constrained('usuarios')->nullOnDelete();
                $table->string('status', 30);
                $table->text('observacoes')->nullable();
                $table->timestamp('created_at');
            });
        }
    }

    public function down(): void
    {
        // As colunas e o histórico pertencem à migração original e podem conter dados.
    }
};

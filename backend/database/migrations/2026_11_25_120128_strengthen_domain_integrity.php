<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        foreach (['alunos' => 'usuario_id', 'professores_orientadores' => 'usuario_id', 'apolices_seguro' => 'estagio_id', 'planos_estagio' => 'estagio_id', 'declaracoes_salubridade' => 'estagio_id', 'relatorios_estagio' => 'estagio_id'] as $table => $column) {
            if (DB::table($table)->select($column)->groupBy($column)->havingRaw('COUNT(*) > 1')->exists()) {
                throw new RuntimeException("Existem vínculos duplicados em {$table}. Reconcilie os dados antes de aplicar esta migration.");
            }
        }
        foreach (['alunos', 'professores_orientadores'] as $table) {
            Schema::table($table, fn (Blueprint $t) => $t->unique('usuario_id'));
        }
        foreach (['apolices_seguro', 'planos_estagio', 'declaracoes_salubridade', 'relatorios_estagio'] as $table) {
            Schema::table($table, fn (Blueprint $t) => $t->unique('estagio_id'));
        }
        Schema::table('documentos', function (Blueprint $t) {
            $t->string('arquivo_path')->nullable();
            $t->string('arquivo_nome')->nullable();
            $t->string('arquivo_mime', 100)->nullable();
            $t->unsignedBigInteger('arquivo_tamanho')->nullable();
            $t->foreignId('enviado_por')->nullable()->constrained('usuarios')->nullOnDelete();
            $t->foreignId('analisado_por')->nullable()->constrained('usuarios')->nullOnDelete();
            $t->timestamp('analisado_em')->nullable();
        });
        Schema::table('diarios_frequencia', function (Blueprint $t) {
            $t->foreignId('assinado_por')->nullable()->constrained('usuarios')->nullOnDelete();
            $t->timestamp('assinado_em')->nullable();
        });
        Schema::table('relatorios_estagio', function (Blueprint $t) {
            $t->foreignId('aprovado_por')->nullable()->constrained('usuarios')->nullOnDelete();
            $t->timestamp('aprovado_em')->nullable();
        });
        Schema::create('historico_estagios', function (Blueprint $t) {
            $t->id();
            $t->foreignId('estagio_id')->constrained('estagios')->restrictOnDelete();
            $t->foreignId('usuario_id')->nullable()->constrained('usuarios')->nullOnDelete();
            $t->string('status_anterior', 30);
            $t->string('status_novo', 30);
            $t->text('motivo')->nullable();
            $t->timestamp('created_at');
        });
        Schema::create('historico_documentos', function (Blueprint $t) {
            $t->id();
            $t->foreignId('documento_id')->constrained('documentos')->restrictOnDelete();
            $t->foreignId('usuario_id')->nullable()->constrained('usuarios')->nullOnDelete();
            $t->string('status', 30);
            $t->text('observacoes')->nullable();
            $t->timestamp('created_at');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('historico_documentos');
        Schema::dropIfExists('historico_estagios');
        Schema::table('relatorios_estagio', function (Blueprint $t) {
            $t->dropConstrainedForeignId('aprovado_por');
            $t->dropColumn('aprovado_em');
        });
        Schema::table('diarios_frequencia', function (Blueprint $t) {
            $t->dropConstrainedForeignId('assinado_por');
            $t->dropColumn('assinado_em');
        });
        Schema::table('documentos', function (Blueprint $t) {
            $t->dropConstrainedForeignId('enviado_por');
            $t->dropConstrainedForeignId('analisado_por');
            $t->dropColumn(['arquivo_path', 'arquivo_nome', 'arquivo_mime', 'arquivo_tamanho', 'analisado_em']);
        });
        foreach (['alunos', 'professores_orientadores'] as $table) {
            Schema::table($table, fn (Blueprint $t) => $t->dropUnique(['usuario_id']));
        }
        foreach (['apolices_seguro', 'planos_estagio', 'declaracoes_salubridade', 'relatorios_estagio'] as $table) {
            Schema::table($table, fn (Blueprint $t) => $t->dropUnique(['estagio_id']));
        }
    }
};

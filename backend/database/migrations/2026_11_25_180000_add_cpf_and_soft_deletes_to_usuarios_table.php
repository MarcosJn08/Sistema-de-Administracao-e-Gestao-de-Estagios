<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('usuarios', function (Blueprint $table) {
            if (! Schema::hasColumn('usuarios', 'cpf')) {
                $table->string('cpf', 14)->nullable()->unique()->after('email');
            }
            if (! Schema::hasColumn('usuarios', 'deleted_at')) {
                $table->softDeletes()->after('updated_at');
            }
        });
    }

    public function down(): void
    {
        Schema::table('usuarios', function (Blueprint $table) {
            if (Schema::hasColumn('usuarios', 'cpf')) {
                $table->dropUnique(['cpf']);
                $table->dropColumn('cpf');
            }
            if (Schema::hasColumn('usuarios', 'deleted_at')) {
                $table->dropSoftDeletes();
            }
        });
    }
};

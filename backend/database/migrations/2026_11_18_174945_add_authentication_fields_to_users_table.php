<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('usuarios', function (Blueprint $table) {
            if (! Schema::hasColumn('usuarios', 'role')) {
                $table->string('role', 20)->nullable()->index();
            }
            if (! Schema::hasColumn('usuarios', 'matricula')) {
                $table->string('matricula', 32)->nullable()->unique();
            }
            if (! Schema::hasColumn('usuarios', 'siape')) {
                $table->string('siape', 32)->nullable()->unique();
            }
            if (! Schema::hasColumn('usuarios', 'cnpj')) {
                $table->string('cnpj', 14)->nullable()->unique();
            }
            if (! Schema::hasColumn('usuarios', 'is_active')) {
                $table->boolean('is_active')->default(true);
            }
        });
    }

    public function down(): void
    {
        Schema::table('usuarios', function (Blueprint $table) {
            $table->dropUnique(['matricula']);
            $table->dropUnique(['siape']);
            $table->dropUnique(['cnpj']);
            $table->dropIndex(['role']);
            $table->dropColumn(['role', 'matricula', 'siape', 'cnpj', 'is_active']);
        });
    }
};

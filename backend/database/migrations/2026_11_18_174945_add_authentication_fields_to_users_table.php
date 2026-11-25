<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->string('role', 20)->nullable()->index();
            $table->string('matricula', 32)->nullable()->unique();
            $table->string('siape', 32)->nullable()->unique();
            $table->string('cnpj', 14)->nullable()->unique();
            $table->boolean('is_active')->default(true);
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropUnique(['matricula']);
            $table->dropUnique(['siape']);
            $table->dropUnique(['cnpj']);
            $table->dropIndex(['role']);
            $table->dropColumn(['role', 'matricula', 'siape', 'cnpj', 'is_active']);
        });
    }
};

<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('estagios', fn (Blueprint $table) => $table->foreignId('professor_orientador_id')->nullable()->change());
    }

    public function down(): void
    {
        if (DB::table('estagios')->whereNull('professor_orientador_id')->exists()) {
            throw new RuntimeException('Vincule os estágios sem orientador antes de reverter esta migração.');
        }

        Schema::table('estagios', fn (Blueprint $table) => $table->foreignId('professor_orientador_id')->change());
    }
};

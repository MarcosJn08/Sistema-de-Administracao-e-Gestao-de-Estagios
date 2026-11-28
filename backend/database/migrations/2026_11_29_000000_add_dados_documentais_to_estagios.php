<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('estagios', fn (Blueprint $table) => $table->json('dados_documentais')->nullable());
    }

    public function down(): void
    {
        Schema::table('estagios', fn (Blueprint $table) => $table->dropColumn('dados_documentais'));
    }
};

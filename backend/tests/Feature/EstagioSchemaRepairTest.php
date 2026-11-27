<?php

namespace Tests\Feature;

use Illuminate\Database\Schema\Blueprint;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Schema;
use Tests\TestCase;

class EstagioSchemaRepairTest extends TestCase
{
    use RefreshDatabase;

    public function test_repair_adds_missing_course_and_can_run_on_current_schema(): void
    {
        Schema::table('estagios', fn (Blueprint $table) => $table->dropConstrainedForeignId('curso_id'));
        $repair = require database_path('migrations/2026_11_26_140000_ensure_curso_id_on_estagios_table.php');
        $repair->up();
        $this->assertTrue(Schema::hasColumn('estagios', 'curso_id'));
        $repair->up();
        $repair->down();
        $this->assertTrue(Schema::hasColumn('estagios', 'curso_id'));
        $this->assertNotEmpty(array_filter(Schema::getForeignKeys('estagios'), fn ($key) => $key['columns'] === ['curso_id']));
    }
}

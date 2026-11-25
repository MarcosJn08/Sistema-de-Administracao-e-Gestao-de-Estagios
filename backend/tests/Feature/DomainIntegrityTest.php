<?php

namespace Tests\Feature;

use App\Enums\UserRole;
use App\Models\Usuario;
use App\Rules\DocumentoFiscal;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\Validator;
use Tests\TestCase;

class DomainIntegrityTest extends TestCase
{
    use RefreshDatabase;

    public function test_individual_relations_have_unique_indexes(): void
    {
        foreach (['alunos' => 'usuario_id', 'professores_orientadores' => 'usuario_id', 'apolices_seguro' => 'estagio_id', 'planos_estagio' => 'estagio_id', 'declaracoes_salubridade' => 'estagio_id', 'relatorios_estagio' => 'estagio_id'] as $table => $column) {
            $indexes = Schema::getIndexes($table);
            $this->assertNotEmpty(array_filter($indexes, fn ($index) => $index['unique'] && $index['columns'] === [$column]), $table);
        }
    }

    public function test_fiscal_documents_are_validated(): void
    {
        foreach ([['52998224725', 11, true], ['11222333000181', 14, true], ['12ABC34501DE35', 14, true], ['12ABC34501DE36', 14, false], ['00000000000', 11, false], ['52998224726', 11, false], ['11222333000182', 14, false]] as [$value, $length, $valid]) {
            $this->assertSame($valid, Validator::make(['documento' => $value], ['documento' => [new DocumentoFiscal($length)]])->passes());
        }
    }

    public function test_audit_response_has_generated_request_id(): void
    {
        $this->getJson('/api/status')->assertOk()->assertHeader('X-Request-ID');
    }

    public function test_api_hides_internal_errors(): void
    {
        Route::get('/api/internal-test', function () {
            throw new \RuntimeException('sensitive database details');
        });
        $this->getJson('/api/internal-test')->assertStatus(500)->assertJsonPath('message', 'Ocorreu um erro interno.')->assertDontSee('sensitive database details');
    }

    public function test_duplicate_course_returns_validation_error(): void
    {
        $this->actingAs(Usuario::factory()->create(['perfil' => UserRole::DIRETOR]), 'sanctum');
        $data = ['nome' => 'Curso único', 'codigo' => 'UN', 'carga_horaria_estagio' => 400];
        $this->postJson('/api/cursos', $data)->assertCreated();
        $this->postJson('/api/cursos', $data)->assertUnprocessable();
    }
}

<?php

namespace Tests\Feature;

use App\Enums\StatusEstagio;
use App\Models\Estagio;
use App\Models\User;
use App\Services\ContratoEstagioService;
use Database\Seeders\DatabaseSeeder;
use Database\Seeders\EstagioSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class EstagioSeederTest extends TestCase
{
    use RefreshDatabase;

    public function test_factory_creates_consistent_links_without_existing_records(): void
    {
        $estagio = Estagio::factory()->trintaHoras()->create();
        $this->assertSame($estagio->aluno->turma->curso_id, $estagio->curso_id);
        $this->assertSame($estagio->supervisor->empresa_concedente_id, $estagio->empresa_concedente_id);
        $this->assertSame('30.00', $estagio->carga_horaria_semanal);
        $this->assertSame(StatusEstagio::RASCUNHO, $estagio->status);
        app(ContratoEstagioService::class)->validar($estagio);
    }

    public function test_seeder_is_repeatable_and_preserves_existing_contract_edits(): void
    {
        $this->seed(DatabaseSeeder::class);
        $this->assertDatabaseCount('usuarios', 17);
        $this->assertDatabaseCount('alunos', 10);
        $this->assertDatabaseCount('professores_orientadores', 5);
        $this->assertDatabaseCount('empresas_concedentes', 1);
        $this->assertDatabaseCount('cursos', 1);
        $this->assertDatabaseCount('turmas', 1);
        $estagio = Estagio::firstOrFail();
        $estagio->update(['cargo' => 'Cargo alterado pelo usuário']);
        $users = User::count();
        $this->seed(EstagioSeeder::class);
        $this->assertDatabaseCount('estagios', 5);
        $this->assertSame($users, User::count());
        $this->assertSame('Cargo alterado pelo usuário', $estagio->fresh()->cargo);
        foreach (Estagio::all() as $contrato) {
            app(ContratoEstagioService::class)->validar($contrato);
            $this->assertNotNull($contrato->apolice);
            $this->assertNotNull($contrato->plano);
            $this->assertSame(0, $contrato->documentos()->count());
            $this->assertNotNull($contrato->supervisor->usuario_id);
        }
    }
}

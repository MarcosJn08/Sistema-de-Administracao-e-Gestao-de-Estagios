<?php

namespace Tests\Feature;

use App\Enums\StatusEstagio;
use App\Enums\UserRole;
use App\Models\Aluno;
use App\Models\Curso;
use App\Models\EmpresaConcedente;
use App\Models\Estagio;
use App\Models\ProfessorOrientador;
use App\Models\SupervisorEmpresa;
use App\Models\Turma;
use App\Models\User;
use App\Models\Usuario;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class ApiWorkflowTest extends TestCase
{
    use RefreshDatabase;

    private Usuario $diretor;

    private Usuario $alunoUser;

    private Usuario $professorUser;

    private Usuario $supervisorUser;

    private array $payload;

    protected function setUp(): void
    {
        parent::setUp();
        $this->diretor = Usuario::factory()->create(['perfil' => UserRole::DIRETOR]);
        $this->alunoUser = Usuario::factory()->create();
        $this->professorUser = Usuario::factory()->create(['perfil' => UserRole::PROFESSOR]);
        $this->supervisorUser = Usuario::factory()->create(['perfil' => UserRole::EMPRESA]);
        $curso = Curso::create(['nome' => 'Curso', 'carga_horaria_estagio' => 2]);
        $turma = Turma::create(['curso_id' => $curso->id, 'nome' => 'Turma', 'ano' => 2026, 'semestre' => 1]);
        $aluno = Aluno::create(['usuario_id' => $this->alunoUser->id, 'turma_id' => $turma->id, 'matricula' => 'A1', 'cpf' => '12345678901']);
        $professor = ProfessorOrientador::create(['usuario_id' => $this->professorUser->id, 'siape_matricula' => 'P1', 'departamento_area' => 'TI', 'max_orientados' => 1]);
        $empresa = EmpresaConcedente::create(['cnpj' => '12345678000190', 'razao_social' => 'Empresa', 'endereco_completo' => 'Rua', 'representante_legal' => 'Responsável', 'status_convenio' => 'ATIVO']);
        $supervisor = SupervisorEmpresa::create(['empresa_concedente_id' => $empresa->id, 'usuario_id' => $this->supervisorUser->id, 'nome' => 'Supervisor', 'cargo' => 'Supervisor', 'formacao' => 'TI', 'telefone' => '123', 'email' => 'supervisor@example.test']);
        $this->payload = ['aluno_id' => $aluno->id, 'empresa_concedente_id' => $empresa->id, 'professor_orientador_id' => $professor->id, 'supervisor_empresa_id' => $supervisor->id, 'modalidade' => 'ORIENTADO', 'data_inicio' => now()->subDays(10)->toDateString(), 'data_termino' => now()->addDays(10)->toDateString(), 'carga_horaria_diaria' => 6];
        Storage::fake('local');
    }

    private function stage(): Estagio
    {
        $id = $this->actingAs($this->diretor, 'sanctum')->postJson('/api/estagios', $this->payload)->assertCreated()->json('data.id');

        return Estagio::findOrFail($id);
    }

    private function prepare(Estagio $estagio): void
    {
        $base = '/api/estagios/'.$estagio->id;
        $this->actingAs($this->alunoUser, 'sanctum')->putJson($base.'/complementos/apolice', ['numero_apolice' => '123', 'nome_seguradora' => 'Seguro'])->assertOk();
        $this->putJson($base.'/complementos/plano', ['objetivos' => 'Aprender', 'atividades_previstas' => 'Programar', 'cronograma' => 'Semanal'])->assertOk();
        foreach (['TCE', 'PLANO_ATIVIDADES', 'FICHA_MATRICULA'] as $tipo) {
            $documento = $this->actingAs($this->alunoUser, 'sanctum')->postJson($base.'/documentos', ['tipo' => $tipo, 'arquivo' => UploadedFile::fake()->create('arquivo.pdf', 10, 'application/pdf')])->assertCreated()->assertJsonMissingPath('data.arquivo_path')->json('data.id');
            $this->actingAs($this->professorUser, 'sanctum')->patchJson($base.'/documentos/'.$documento.'/analise', ['status' => 'DEFERIDO'])->assertOk();
        }
    }

    public function test_complete_workflow_preserves_fractional_hours_and_audit(): void
    {
        $stage = $this->stage();
        $base = '/api/estagios/'.$stage->id;
        $this->assertSame(StatusEstagio::RASCUNHO, $stage->status);
        $this->prepare($stage);
        $this->actingAs($this->diretor, 'sanctum')->patchJson($base.'/status', ['status' => 'EM_ANDAMENTO'])->assertOk();
        $frequency = $this->actingAs($this->alunoUser, 'sanctum')->postJson($base.'/frequencias', ['data' => now()->toDateString(), 'hora_entrada' => '08:00', 'hora_saida' => '10:30'])->assertCreated()->json('data.id');
        $this->assertEquals(0, $stage->horasCumpridas());
        $this->actingAs($this->supervisorUser, 'sanctum')->postJson($base.'/frequencias/'.$frequency.'/assinatura')->assertOk();
        $this->assertEquals(2.5, $stage->horasCumpridas());
        $this->assertEquals(2.5, $stage->aluno->carga_horaria_cumprida);
        $this->assertEquals(0, $stage->aluno->cargaHorariaRestante());
        $this->actingAs($this->alunoUser, 'sanctum')->putJson($base.'/frequencias/'.$frequency, ['data' => now()->toDateString(), 'hora_entrada' => '08:00', 'hora_saida' => '09:00'])->assertUnprocessable();
        $this->putJson($base.'/complementos/relatorio', ['resumo_atividades' => 'Atividades', 'relacao_teoria_pratica' => 'Aplicação'])->assertOk();
        $this->actingAs($this->professorUser, 'sanctum')->postJson($base.'/relatorio/aprovacao')->assertOk();
        $this->actingAs($this->diretor, 'sanctum')->patchJson($base.'/status', ['status' => 'CONCLUIDO'])->assertOk();
        $this->patchJson($base.'/status', ['status' => 'EM_ANDAMENTO'])->assertUnprocessable();
        $this->assertDatabaseHas('historico_estagios', ['estagio_id' => $stage->id, 'status_novo' => 'CONCLUIDO', 'usuario_id' => $this->diretor->id]);
        $this->assertDatabaseHas('diarios_frequencia', ['id' => $frequency, 'assinado_por' => $this->supervisorUser->id]);
        $this->assertDatabaseCount('historico_documentos', 6);
    }

    public function test_login_logout_and_revoked_token(): void
    {
        $login = $this->postJson('/api/auth/login', ['email' => $this->diretor->email, 'password' => 'SenhaDeTeste123!'])->assertOk()->assertJsonMissingPath('data.usuario.password');
        $token = $login->json('data.token');
        $this->withToken($token)->getJson('/api/auth/me')->assertOk();
        $this->withToken($token)->postJson('/api/auth/logout')->assertNoContent();
        $this->assertDatabaseCount('personal_access_tokens', 0);
        $this->app['auth']->forgetGuards();
        $this->withToken($token)->getJson('/api/auth/me')->assertUnauthorized();
    }

    public function test_inactive_user_cannot_login_or_use_an_existing_token(): void
    {
        $token = $this->alunoUser->createToken('test')->plainTextToken;
        $this->alunoUser->update(['status' => 'inativo']);
        $this->postJson('/api/auth/login', ['email' => $this->alunoUser->email, 'password' => 'SenhaDeTeste123!'])->assertUnprocessable();
        $this->withToken($token)->getJson('/api/auth/me')->assertForbidden();
    }

    public function test_login_is_rate_limited(): void
    {
        for ($i = 0; $i < 5; $i++) {
            $this->postJson('/api/auth/login', ['email' => 'missing@example.test', 'password' => 'invalid'])->assertUnprocessable();
        }
        $this->postJson('/api/auth/login', ['email' => 'missing@example.test', 'password' => 'invalid'])->assertStatus(429)->assertJsonPath('success', false);
    }

    public function test_anonymous_and_wrong_role_cannot_access_administration(): void
    {
        $this->getJson('/api/usuarios')->assertUnauthorized()->assertJsonPath('success', false);
        $this->actingAs($this->alunoUser, 'sanctum')->getJson('/api/usuarios')->assertForbidden();
        $this->postJson('/api/estagios', $this->payload)->assertForbidden();
    }

    public function test_unrelated_users_cannot_read_or_mutate_another_stage(): void
    {
        $stage = $this->stage();
        foreach ([UserRole::ALUNO, UserRole::PROFESSOR, UserRole::EMPRESA] as $role) {
            $outsider = Usuario::factory()->create(['perfil' => $role]);
            $this->actingAs($outsider, 'sanctum')->getJson('/api/estagios/'.$stage->id)->assertForbidden();
            $this->getJson('/api/estagios')->assertOk()->assertJsonPath('data.total', 0);
            $this->postJson('/api/estagios/'.$stage->id.'/documentos', [])->assertForbidden();
        }
    }

    public function test_creation_rejects_invalid_company_supervisor_dates_and_status(): void
    {
        $this->actingAs($this->diretor, 'sanctum');
        $this->postJson('/api/estagios', $this->payload + ['status' => 'CONCLUIDO'])->assertUnprocessable();
        $this->postJson('/api/estagios', array_replace($this->payload, ['data_termino' => '2000-01-01']))->assertUnprocessable();
        EmpresaConcedente::first()->update(['status_convenio' => 'EXPIRADO']);
        $this->postJson('/api/estagios', $this->payload)->assertUnprocessable();
        EmpresaConcedente::first()->update(['status_convenio' => 'ATIVO']);
        $other = EmpresaConcedente::create(['cnpj' => '99999999000199', 'razao_social' => 'Outra', 'endereco_completo' => 'Rua', 'representante_legal' => 'Outro', 'status_convenio' => 'ATIVO']);
        $this->postJson('/api/estagios', array_replace($this->payload, ['empresa_concedente_id' => $other->id]))->assertUnprocessable();
    }

    public function test_activation_requires_documents_and_rechecks_professor_capacity(): void
    {
        $first = $this->stage();
        $second = $this->stage();
        $this->patchJson('/api/estagios/'.$first->id.'/status', ['status' => 'EM_ANDAMENTO'])->assertUnprocessable();
        $this->prepare($first);
        $this->prepare($second);
        $this->actingAs($this->diretor, 'sanctum')->patchJson('/api/estagios/'.$first->id.'/status', ['status' => 'EM_ANDAMENTO'])->assertOk();
        $this->patchJson('/api/estagios/'.$second->id.'/status', ['status' => 'EM_ANDAMENTO'])->assertUnprocessable();
        $this->patchJson('/api/estagios/'.$first->id.'/status', ['status' => 'CONCLUIDO'])->assertUnprocessable();
    }

    public function test_document_adjustments_create_new_version_and_download_is_private(): void
    {
        $stage = $this->stage();
        $base = '/api/estagios/'.$stage->id;
        $id = $this->actingAs($this->alunoUser, 'sanctum')->postJson($base.'/documentos', ['tipo' => 'TCE', 'arquivo' => UploadedFile::fake()->create('tce.pdf', 5, 'application/pdf')])->assertCreated()->json('data.id');
        $this->patchJson($base.'/documentos/'.$id.'/analise', ['status' => 'DEFERIDO'])->assertForbidden();
        $this->actingAs($this->professorUser, 'sanctum')->patchJson($base.'/documentos/'.$id.'/analise', ['status' => 'NECESSITA_AJUSTES'])->assertUnprocessable();
        $this->patchJson($base.'/documentos/'.$id.'/analise', ['status' => 'NECESSITA_AJUSTES', 'observacoes' => 'Corrigir datas'])->assertOk();
        $this->actingAs($this->alunoUser, 'sanctum')->postJson($base.'/documentos', ['tipo' => 'TCE', 'arquivo' => UploadedFile::fake()->create('tce.pdf', 5, 'application/pdf')])->assertCreated();
        $this->getJson($base.'/documentos/'.$id.'/download')->assertOk();
        $outsider = Usuario::factory()->create();
        $this->actingAs($outsider, 'sanctum')->getJson($base.'/documentos/'.$id.'/download')->assertForbidden();
        $this->assertDatabaseCount('documentos', 2);
    }

    public function test_invalid_upload_and_duplicate_pending_document_leave_no_orphan_file(): void
    {
        $stage = $this->stage();
        $base = '/api/estagios/'.$stage->id.'/documentos';
        $this->actingAs($this->alunoUser, 'sanctum')->postJson($base, ['tipo' => 'TCE', 'arquivo' => UploadedFile::fake()->create('malware.exe', 5, 'application/octet-stream')])->assertUnprocessable();
        $this->postJson($base, ['tipo' => 'TCE', 'arquivo' => UploadedFile::fake()->create('tce.pdf', 5, 'application/pdf')])->assertCreated();
        $this->postJson($base, ['tipo' => 'TCE', 'arquivo' => UploadedFile::fake()->create('tce.pdf', 5, 'application/pdf')])->assertUnprocessable();
        $this->assertCount(1, Storage::disk('local')->allFiles('documentos'));
    }

    public function test_frequency_rejects_future_outside_period_excess_and_duplicates(): void
    {
        $stage = $this->stage();
        $this->prepare($stage);
        $base = '/api/estagios/'.$stage->id;
        $this->actingAs($this->diretor, 'sanctum')->patchJson($base.'/status', ['status' => 'EM_ANDAMENTO'])->assertOk();
        $this->actingAs($this->alunoUser, 'sanctum');
        $data = ['data' => now()->toDateString(), 'hora_entrada' => '08:00', 'hora_saida' => '10:00'];
        foreach ([['data' => now()->addDay()->toDateString()], ['data' => '2000-01-01'], ['hora_saida' => '18:00'], ['hora_saida' => '07:00'], ['horas_diarias' => 20], ['assinado_supervisor' => true]] as $invalid) {
            $this->postJson($base.'/frequencias', array_replace($data, $invalid))->assertUnprocessable();
        }
        $id = $this->postJson($base.'/frequencias', $data)->assertCreated()->json('data.id');
        $this->postJson($base.'/frequencias', $data)->assertUnprocessable();
        $this->postJson($base.'/frequencias/'.$id.'/assinatura')->assertForbidden();
    }

    public function test_admin_crud_validation_and_token_revocation(): void
    {
        $this->actingAs($this->diretor, 'sanctum');
        $id = $this->postJson('/api/usuarios', ['nome' => 'Novo', 'email' => 'novo@example.test', 'password' => 'SenhaSegura1234', 'perfil' => 'ALUNO'])->assertCreated()->assertJsonMissingPath('data.password')->json('data.id');
        $user = Usuario::find($id);
        $user->createToken('test');
        $this->patchJson('/api/usuarios/'.$id, ['status' => 'inativo'])->assertOk();
        $this->assertSame(0, $user->tokens()->count());
        $this->patchJson('/api/usuarios/'.$this->diretor->id, ['status' => 'inativo'])->assertUnprocessable();
        $this->patchJson('/api/usuarios/'.$id, ['perfil' => 'DIRETOR'])->assertUnprocessable();
        $this->getJson('/api/cursos?per_page=101')->assertUnprocessable();
        $this->postJson('/api/alunos', ['usuario_id' => $this->diretor->id, 'turma_id' => Turma::first()->id, 'matricula' => 'X', 'cpf' => '00000000000'])->assertUnprocessable();
        $this->getJson('/api/cursos')->assertOk();
    }

    public function test_terminal_stage_requires_reason_and_prevents_mutation(): void
    {
        $stage = $this->stage();
        $base = '/api/estagios/'.$stage->id;
        $this->patchJson($base.'/status', ['status' => 'ENCERRADO'])->assertUnprocessable();
        $this->patchJson($base.'/status', ['status' => 'ENCERRADO', 'motivo' => 'Desistência'])->assertOk();
        $this->actingAs($this->alunoUser, 'sanctum')->putJson($base.'/complementos/apolice', ['numero_apolice' => 'x', 'nome_seguradora' => 'y'])->assertUnprocessable();
        $this->postJson($base.'/documentos', ['tipo' => 'TCE', 'arquivo' => UploadedFile::fake()->create('tce.pdf', 5, 'application/pdf')])->assertUnprocessable();
        $this->assertCount(0, Storage::disk('local')->allFiles());
    }

    public function test_error_envelope_for_missing_route_and_method(): void
    {
        $this->getJson('/api/nao-existe')->assertNotFound()->assertJsonPath('success', false);
        $this->postJson('/api/status')->assertStatus(405)->assertJsonPath('success', false);
    }

    public function test_seeder_is_idempotent_and_does_not_create_default_admin(): void
    {
        $this->seed();
        $this->seed();
        $this->assertDatabaseMissing('usuarios', ['email' => 'admin@sage.test']);
    }

    public function test_document_id_cannot_be_accessed_through_another_stage(): void
    {
        $first = $this->stage();
        $second = $this->stage();
        $id = $this->actingAs($this->alunoUser, 'sanctum')->postJson('/api/estagios/'.$first->id.'/documentos', ['tipo' => 'TCE', 'arquivo' => UploadedFile::fake()->create('tce.pdf', 5, 'application/pdf')])->assertCreated()->json('data.id');
        $this->getJson('/api/estagios/'.$second->id.'/documentos/'.$id.'/download')->assertNotFound();
        $this->actingAs($this->professorUser, 'sanctum')->patchJson('/api/estagios/'.$second->id.'/documentos/'.$id.'/analise', ['status' => 'DEFERIDO'])->assertNotFound();
        $this->getJson('/api/estagios/'.$first->id.'/documentos/'.$id.'/historico')->assertOk()->assertJsonPath('data.total', 1);
    }

    public function test_administrative_registrations_and_immutable_relationships(): void
    {
        $this->actingAs($this->diretor, 'sanctum');
        $course = $this->postJson('/api/cursos', ['nome' => 'Novo curso', 'carga_horaria_estagio' => 300])->assertCreated()->json('data.id');
        $class = $this->postJson('/api/turmas', ['curso_id' => $course, 'nome' => 'Nova turma', 'ano' => 2026, 'semestre' => 2])->assertCreated()->json('data.id');
        $user = Usuario::factory()->create();
        $student = $this->postJson('/api/alunos', ['usuario_id' => $user->id, 'turma_id' => $class, 'matricula' => 'NOVO', 'cpf' => '529.982.247-25'])->assertCreated()->assertJsonPath('data.cpf', '52998224725')->json('data.id');
        $this->patchJson('/api/alunos/'.$student, ['turma_id' => Turma::first()->id])->assertUnprocessable();
        $company = $this->postJson('/api/empresas', ['cnpj' => '12.abc.345/01de-35', 'razao_social' => 'Nova empresa', 'endereco_completo' => 'Rua', 'representante_legal' => 'Representante'])->assertCreated()->assertJsonPath('data.cnpj', '12ABC34501DE35')->json('data.id');
        $this->patchJson('/api/empresas/'.$company, ['status_convenio' => 'ATIVO'])->assertOk();
        $prof = Usuario::factory()->create(['perfil' => UserRole::PROFESSOR]);
        $this->postJson('/api/professores', ['usuario_id' => $prof->id, 'siape_matricula' => 'P2', 'departamento_area' => 'TI', 'max_orientados' => 2])->assertCreated();
        $supervisor = $this->postJson('/api/supervisores', ['empresa_concedente_id' => $company, 'nome' => 'Novo supervisor', 'cargo' => 'Supervisor', 'formacao' => 'TI', 'telefone' => '123', 'email' => 'novo@example.test'])->assertCreated()->json('data.id');
        $this->patchJson('/api/supervisores/'.$supervisor, ['usuario_id' => $this->supervisorUser->id])->assertOk();
        $this->getJson('/api/alunos/'.$student)->assertOk();
    }

    public function test_expired_stage_and_inactive_academic_records_are_rejected(): void
    {
        $stage = $this->stage();
        $this->prepare($stage);
        $stage->update(['data_termino' => now()->subDay()]);
        $this->actingAs($this->diretor, 'sanctum')->patchJson('/api/estagios/'.$stage->id.'/status', ['status' => 'EM_ANDAMENTO'])->assertUnprocessable();
        Turma::first()->update(['status' => 'encerrada']);
        $this->postJson('/api/estagios', $this->payload)->assertUnprocessable();
    }

    public function test_report_approval_and_evaluations_follow_roles_and_lock_after_approval(): void
    {
        $stage = $this->stage();
        $this->prepare($stage);
        $base = '/api/estagios/'.$stage->id;
        $this->actingAs($this->diretor, 'sanctum')->patchJson($base.'/status', ['status' => 'EM_ANDAMENTO'])->assertOk();
        $this->actingAs($this->alunoUser, 'sanctum')->putJson($base.'/avaliacao', ['auto_avaliacao' => 'Aprendi'])->assertOk();
        $report = ['resumo_atividades' => 'Atividades', 'relacao_teoria_pratica' => 'Aplicação'];
        $this->putJson($base.'/complementos/relatorio', $report + ['aprovado' => true])->assertUnprocessable();
        $this->putJson($base.'/complementos/relatorio', $report)->assertOk();
        $this->postJson($base.'/relatorio/aprovacao')->assertForbidden();
        $this->actingAs($this->supervisorUser, 'sanctum')->putJson($base.'/avaliacao', ['nota_desempenho' => 11, 'conceito_atitude' => 'Bom', 'parecer_final' => 'Bom'])->assertUnprocessable();
        $this->putJson($base.'/avaliacao', ['nota_desempenho' => 9, 'conceito_atitude' => 'Bom', 'parecer_final' => 'Bom'])->assertOk();
        $this->actingAs($this->professorUser, 'sanctum')->postJson($base.'/relatorio/aprovacao')->assertOk();
        $this->actingAs($this->alunoUser, 'sanctum')->putJson($base.'/complementos/relatorio', $report)->assertUnprocessable();
    }

    public function test_director_assigns_and_transfers_orientation_and_access_follows_the_current_link(): void
    {
        $diretor = User::findOrFail($this->diretor->id);
        $primeiro = User::findOrFail($this->professorUser->id);
        $this->actingAs($diretor, 'sanctum');
        $usuarioId = $this->postJson('/api/usuarios', [
            'nome' => 'Professor Integração', 'email' => 'professor-integracao@ifnmg.edu.br',
            'password' => 'SenhaDeTeste123', 'perfil' => 'PROFESSOR', 'siape' => '9000101',
            'departamento' => 'Pesquisa', 'titulacao' => 'Mestre', 'maximoOrientandos' => 1,
        ])->assertCreated()->assertJsonPath('data.titulacao', 'Mestre')->json('data.id');
        $segundo = User::findOrFail($usuarioId);
        $novo = $segundo->professor()->firstOrFail();
        $this->assertNotSame($usuarioId, $novo->id);
        $this->putJson('/api/usuarios/'.$usuarioId, [
            'titulacao' => 'Doutor', 'departamento' => 'Pesquisa Aplicada',
        ])->assertOk()->assertJsonPath('data.titulacao', 'Doutor');
        $this->getJson('/api/orientadores')->assertOk()->assertJsonFragment([
            'id' => $novo->id, 'usuario_id' => $usuarioId, 'titulacao' => 'Doutor',
            'departamento' => 'Pesquisa Aplicada',
        ]);
        $id = $this->postJson('/api/estagios', array_diff_key($this->payload, ['professor_orientador_id' => true]))
            ->assertCreated()->json('data.id');
        $base = '/api/estagios/'.$id;

        $this->patchJson($base.'/status', ['status' => 'EM_ANDAMENTO'])->assertUnprocessable()
            ->assertJsonValidationErrors('professor_orientador_id');
        $this->getJson('/api/orientadores')->assertOk()
            ->assertJsonPath('data.discentes_sem_orientador.0.estagios.0.id', $id);
        $this->actingAs($primeiro, 'sanctum')->getJson($base)->assertForbidden();
        $this->patchJson($base.'/orientador', ['professor_orientador_id' => $novo->id])->assertForbidden();
        $this->getJson('/api/orientadores')->assertForbidden();

        $this->actingAs($diretor, 'sanctum')->patchJson($base.'/orientador', [
            'professor_orientador_id' => $this->payload['professor_orientador_id'],
        ])->assertOk()->assertJsonPath('data.professor_orientador_id', $this->payload['professor_orientador_id']);
        $this->getJson('/api/orientadores')->assertOk()->assertJsonCount(0, 'data.discentes_sem_orientador');

        $outroEstagio = $this->stage();
        $this->actingAs($primeiro, 'sanctum')->getJson('/api/orientador/meus-discentes')->assertOk()
            ->assertJsonCount(1, 'data')->assertJsonCount(2, 'data.0.estagios');
        $this->getJson($base)->assertOk();
        $this->actingAs($segundo, 'sanctum')->getJson($base)->assertForbidden();

        $documento = $this->actingAs($this->alunoUser, 'sanctum')->postJson($base.'/documentos', [
            'tipo' => 'RELATORIO_PARCIAL', 'arquivo' => UploadedFile::fake()->create('relatorio.pdf', 5, 'application/pdf'),
        ])->assertCreated()->json('data.id');
        $analise = $base.'/documentos/'.$documento.'/analise';
        $this->patchJson($base.'/orientador', ['professor_orientador_id' => $novo->id])->assertForbidden();
        $this->getJson('/api/orientador/meus-discentes')->assertForbidden();
        $this->actingAs($this->supervisorUser, 'sanctum')
            ->patchJson($base.'/orientador', ['professor_orientador_id' => $novo->id])->assertForbidden();

        $this->actingAs($diretor, 'sanctum')->patchJson($base.'/orientador', [
            'professor_orientador_id' => $novo->id,
        ])->assertOk();
        $this->getJson('/api/orientador/meus-discentes')->assertForbidden();
        $this->assertDatabaseHas('estagios', ['id' => $id, 'professor_orientador_id' => $novo->id]);

        $this->actingAs($primeiro, 'sanctum')->getJson($base)->assertForbidden();
        $this->getJson($base.'/documentos')->assertForbidden();
        $this->patchJson($analise, ['status' => 'DEFERIDO'])->assertForbidden();
        $this->postJson($base.'/relatorio/aprovacao')->assertForbidden();
        $this->getJson('/api/orientador/meus-discentes?professor_orientador_id='.$novo->id)->assertOk()
            ->assertJsonCount(1, 'data.0.estagios')->assertJsonPath('data.0.estagios.0.id', $outroEstagio->id);

        $this->actingAs($segundo, 'sanctum')->getJson($base)->assertOk();
        $this->putJson('/api/usuarios/'.$usuarioId, ['titulacao' => 'Sem permissão'])->assertForbidden();
        $this->getJson('/api/orientador/meus-discentes')->assertOk()->assertJsonCount(1, 'data')
            ->assertJsonCount(1, 'data.0.estagios')->assertJsonPath('data.0.estagios.0.id', $id)
            ->assertJsonPath('data.0.estagios.0.documentos.0.tem_arquivo', true)
            ->assertJsonMissingPath('data.0.estagios.0.documentos.0.arquivo_path');
        $this->patchJson($analise, ['status' => 'DEFERIDO'])->assertOk()->assertJsonPath('data.status', 'DEFERIDO');
    }

    public function test_orientation_validates_the_target_account_capacity_and_stage_state(): void
    {
        $this->getJson('/api/orientadores')->assertUnauthorized();
        $this->getJson('/api/orientador/meus-discentes')->assertUnauthorized();
        $cheio = $this->stage();
        $cheio->update(['status' => StatusEstagio::EM_ANDAMENTO]);
        $origem = User::factory()->create(['perfil' => UserRole::PROFESSOR]);
        $orientador = $origem->professor()->create(['siape_matricula' => 'P2', 'departamento_area' => 'Pesquisa', 'max_orientados' => 2]);
        $estagio = Estagio::create(array_replace($this->payload, ['professor_orientador_id' => $orientador->id, 'status' => StatusEstagio::RASCUNHO]));
        $url = '/api/estagios/'.$estagio->id.'/orientador';
        $this->actingAs($this->diretor, 'sanctum');

        foreach ([[], ['professor_orientador_id' => 'abc'], ['professor_orientador_id' => 99999], [
            'professor_orientador_id' => $this->payload['professor_orientador_id'],
        ]] as $dados) {
            $this->patchJson($url, $dados)->assertUnprocessable()->assertJsonValidationErrors('professor_orientador_id');
        }
        $this->patchJson('/api/estagios/'.$cheio->id.'/orientador', [
            'professor_orientador_id' => $this->payload['professor_orientador_id'],
        ])->assertOk();
        $this->getJson('/api/orientadores')->assertOk()->assertJsonFragment([
            'departamento' => 'TI', 'disponivel' => false, 'estagios_ativos' => 1,
        ]);
        $this->assertDatabaseHas('estagios', ['id' => $estagio->id, 'professor_orientador_id' => $orientador->id]);

        $cheio->update(['status' => StatusEstagio::CONCLUIDO]);
        $this->patchJson('/api/estagios/'.$cheio->id.'/orientador', [
            'professor_orientador_id' => $orientador->id,
        ])->assertUnprocessable()->assertJsonValidationErrors('estagio');
        $primeiro = User::findOrFail($this->professorUser->id);
        $primeiro->update(['status' => 'inativo', 'is_active' => false]);
        $this->patchJson($url, ['professor_orientador_id' => $this->payload['professor_orientador_id']])
            ->assertUnprocessable()->assertJsonValidationErrors('professor_orientador_id');
        $this->actingAs($primeiro, 'sanctum')->getJson('/api/orientador/meus-discentes')->assertForbidden();

        $semVinculo = User::factory()->create(['perfil' => UserRole::PROFESSOR]);
        $this->actingAs($semVinculo, 'sanctum')->getJson('/api/orientador/meus-discentes')->assertOk()
            ->assertExactJson(['success' => true, 'message' => 'Operação realizada com sucesso.', 'data' => [], 'errors' => []]);
    }

    public function test_cancellation_for_misconduct_removes_credit_without_erasing_signed_frequency(): void
    {
        $stage = $this->stage();
        $this->prepare($stage);
        $base = '/api/estagios/'.$stage->id;
        $this->actingAs($this->diretor, 'sanctum')->patchJson($base.'/status', ['status' => 'EM_ANDAMENTO'])->assertOk();
        $id = $this->actingAs($this->alunoUser, 'sanctum')->postJson($base.'/frequencias', ['data' => now()->toDateString(), 'hora_entrada' => '08:00', 'hora_saida' => '10:30'])->assertCreated()->json('data.id');
        $this->actingAs($this->supervisorUser, 'sanctum')->postJson($base.'/frequencias/'.$id.'/assinatura')->assertOk();
        $this->postJson($base.'/frequencias/'.$id.'/assinatura')->assertUnprocessable();
        $this->assertEquals(2.5, $stage->aluno->carga_horaria_cumprida);
        $this->actingAs($this->diretor, 'sanctum')->patchJson($base.'/status', ['status' => 'CANCELADO_DESVIO_FUNCAO', 'motivo' => 'Atividade incompatível'])->assertOk();
        $this->assertEquals(0, $stage->aluno->carga_horaria_cumprida);
        $this->assertDatabaseHas('diarios_frequencia', ['id' => $id, 'assinado_supervisor' => true]);
    }
}

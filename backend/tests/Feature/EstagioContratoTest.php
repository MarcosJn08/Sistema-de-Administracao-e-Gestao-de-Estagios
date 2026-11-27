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
use App\Models\Usuario;
use Carbon\Carbon;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class EstagioContratoTest extends TestCase
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
        $this->payload = ['aluno_id' => $aluno->id, 'empresa_concedente_id' => $empresa->id, 'professor_orientador_id' => $professor->id, 'supervisor_empresa_id' => $supervisor->id, 'modalidade' => 'ORIENTADO', 'data_inicio' => now()->subDays(10)->toDateString(), 'data_termino' => now()->addDays(10)->toDateString(), 'carga_horaria_diaria' => 6, 'carga_horaria_semanal' => 20, 'meta_horas_tce' => 200];
        Storage::fake('local');
    }

    private function criar(array $extra = [])
    {
        return $this->actingAs($this->diretor, 'sanctum')->post('/api/estagios', array_replace($this->payload, [
            'cargo' => 'Desenvolvimento',
            'termo_formalizado' => UploadedFile::fake()->create('termo.pdf', 10, 'application/pdf'),
        ], $extra), ['Accept' => 'application/json']);
    }

    public function test_criacao_exige_pdf_e_retorna_relacoes_sem_caminho_privado(): void
    {
        $this->criar(['termo_formalizado' => null])->assertUnprocessable();
        $r = $this->criar()->assertCreated()->assertJsonPath('data.status', 'EM_ANALISE')
            ->assertJsonPath('data.cargo', 'Desenvolvimento')->assertJsonMissingPath('data.documentos.0.arquivo_path');
        $id = $r->json('data.id');
        $this->getJson('/api/estagios/'.$id)->assertOk()->assertJsonPath('data.curso.nome', 'Curso');
        $this->getJson('/api/estagios?status=EM_ANALISE')->assertOk()->assertJsonPath('meta.total', 1);
        $this->getJson('/api/estagios?status=CONCLUIDO')->assertOk()->assertJsonPath('meta.total', 0);
        $this->putJson('/api/estagios/'.$id.'/complementos/apolice', ['numero_apolice' => 'TCE-1', 'nome_seguradora' => 'Seguro'])->assertOk();
        $this->putJson('/api/estagios/'.$id.'/complementos/plano', ['objetivos' => 'Aprender', 'atividades_previstas' => 'Desenvolver', 'cronograma' => 'Semanal'])->assertOk();
        $this->assertDatabaseHas('historico_documentos', ['status' => 'EM_ANALISE']);
    }

    public function test_sobreposicao_atualizacao_e_isolamento(): void
    {
        $id = $this->criar()->assertCreated()->json('data.id');
        $this->criar()->assertUnprocessable()->assertJsonValidationErrors('carga_horaria_semanal');
        $this->criar(['carga_horaria_semanal' => 10])->assertCreated();
        $this->putJson('/api/estagios/'.$id, ['cargo' => 'Novo cargo'])->assertOk();
        $this->putJson('/api/estagios/'.$id, ['carga_horaria_semanal' => 21])->assertUnprocessable();
        $this->putJson('/api/estagios/'.$id, ['data_inicio' => now()->addMonths(2)->toDateString()])->assertUnprocessable();
        $this->actingAs(Usuario::factory()->create(), 'sanctum')->getJson('/api/estagios/'.$id)->assertForbidden();
        $this->getJson('/api/estagios')->assertOk()->assertJsonPath('meta.total', 0);
        $this->putJson('/api/estagios/'.$id, ['cargo' => 'Inválido'])->assertForbidden();
    }

    public function test_periodos_separados_nao_sao_somados(): void
    {
        $this->criar()->assertCreated();
        $this->criar(['data_inicio' => now()->addMonths(2)->toDateString(), 'data_termino' => now()->addMonths(3)->toDateString()])->assertCreated();
    }

    public function test_teto_frequencia_e_reducao_do_contrato(): void
    {
        $id = $this->criar(['meta_horas_tce' => 2])->assertCreated()->json('data.id');
        Estagio::findOrFail($id)->update(['status' => StatusEstagio::EM_ANDAMENTO]);
        $url = '/api/estagios/'.$id.'/frequencias';
        $f = $this->actingAs($this->alunoUser, 'sanctum')->postJson($url, ['data' => today()->toDateString(), 'hora_entrada' => '08:00', 'hora_saida' => '10:00'])->assertCreated()->json('data.id');
        $this->postJson($url, ['data' => today()->subDay()->toDateString(), 'hora_entrada' => '08:00', 'hora_saida' => '08:01'])->assertUnprocessable();
        $this->actingAs($this->supervisorUser, 'sanctum')->postJson($url.'/'.$f.'/assinatura')->assertOk();
        $this->actingAs($this->diretor, 'sanctum')->putJson('/api/estagios/'.$id, ['meta_horas_tce' => 1])->assertUnprocessable();
    }

    public function test_supervisor_limite_de_dez_alunos_e_filtro_empresa(): void
    {
        $base = $this->payload;
        for ($i = 0; $i < 10; $i++) {
            $aluno = Aluno::create(['usuario_id' => Usuario::factory()->create()->id, 'turma_id' => Aluno::find($base['aluno_id'])->turma_id, 'matricula' => 'Extra'.$i, 'cpf' => str_pad((string) $i, 11, '0', STR_PAD_LEFT)]);
            Estagio::create(array_replace($base, ['aluno_id' => $aluno->id, 'status' => 'EM_ANALISE']));
        }
        $this->criar()->assertUnprocessable()->assertJsonValidationErrors('supervisor_empresa_id');
        $this->getJson('/api/estagios?empresa_concedente_id='.$base['empresa_concedente_id'])->assertOk()->assertJsonPath('meta.total', 10);
    }

    public function test_limite_semanal_e_correcao_sem_dupla_contagem(): void
    {
        $this->travelTo(Carbon::parse('2026-11-26 12:00:00'));
        $id = $this->criar(['carga_horaria_semanal' => 6, 'data_inicio' => '2026-11-01', 'data_termino' => '2026-12-31'])->assertCreated()->json('data.id');
        Estagio::find($id)->update(['status' => 'EM_ANDAMENTO']);
        $url = '/api/estagios/'.$id.'/frequencias';
        $f = $this->actingAs($this->alunoUser, 'sanctum')->postJson($url, ['data' => '2026-11-23', 'hora_entrada' => '08:00', 'hora_saida' => '14:00'])->assertCreated()->json('data.id');
        $this->postJson($url, ['data' => '2026-11-24', 'hora_entrada' => '08:00', 'hora_saida' => '09:00'])->assertUnprocessable();
        $this->putJson($url.'/'.$f, ['data' => '2026-11-23', 'hora_entrada' => '08:00', 'hora_saida' => '13:00'])->assertOk();
        $this->postJson($url, ['data' => '2026-11-24', 'hora_entrada' => '08:00', 'hora_saida' => '09:00'])->assertCreated();
    }

    public function test_bearer_token_resolves_base_user_and_authorizes_contracts(): void
    {
        $id = $this->criar()->assertCreated()->json('data.id');
        $token = $this->alunoUser->createToken('regression')->plainTextToken;
        app('auth')->forgetGuards();
        $this->withToken($token)->getJson('/api/estagios')->assertOk()->assertJsonPath('meta.total', 1);
        app('auth')->forgetGuards();
        $this->withToken($token)->getJson('/api/estagios/'.$id)->assertOk()->assertJsonPath('data.id', $id);
        app('auth')->forgetGuards();
        $this->withToken($token)->putJson('/api/estagios/'.$id, ['cargo' => 'Proibido'])->assertForbidden();
    }

    public function test_empresa_cria_com_bearer_apenas_para_seu_supervisor_e_empresa(): void
    {
        $token = $this->supervisorUser->createToken('empresa')->plainTextToken;
        $dados = array_replace($this->payload, [
            'cargo' => 'Desenvolvimento',
            'termo_formalizado' => UploadedFile::fake()->create('termo.pdf', 10, 'application/pdf'),
        ]);
        $id = $this->withToken($token)->post('/api/estagios', $dados, ['Accept' => 'application/json'])
            ->assertCreated()->assertJsonPath('data.status', 'EM_ANALISE')->json('data.id');
        $this->assertDatabaseHas('documentos', ['estagio_id' => $id, 'enviado_por' => $this->supervisorUser->id]);
        app('auth')->forgetGuards();
        $this->withToken($token)->getJson('/api/estagios/'.$id)->assertOk();
        app('auth')->forgetGuards();
        $this->withToken($token)->patchJson('/api/estagios/'.$id.'/status', ['status' => 'EM_ANDAMENTO'])->assertForbidden();
        app('auth')->forgetGuards();
        $this->withToken($token)->putJson('/api/estagios/'.$id, ['cargo' => 'Alteração'])->assertForbidden();
    }

    public function test_empresa_nao_pode_usar_supervisor_alheio_ou_empresa_alheia(): void
    {
        $outra = EmpresaConcedente::create(['cnpj' => '99999999000199', 'razao_social' => 'Outra', 'endereco_completo' => 'Rua', 'representante_legal' => 'Outro', 'status_convenio' => 'ATIVO']);
        $supervisor = SupervisorEmpresa::create(['empresa_concedente_id' => $this->payload['empresa_concedente_id'], 'nome' => 'Outro supervisor', 'cargo' => 'Supervisor', 'formacao' => 'TI', 'telefone' => '123', 'email' => 'outro@example.test']);
        foreach ([['empresa_concedente_id' => $outra->id], ['supervisor_empresa_id' => $supervisor->id]] as $alteracao) {
            $this->actingAs($this->supervisorUser, 'sanctum')->post('/api/estagios', array_replace($this->payload, [
                'cargo' => 'Desenvolvimento', 'termo_formalizado' => UploadedFile::fake()->create('termo.pdf', 10, 'application/pdf'),
            ], $alteracao), ['Accept' => 'application/json'])->assertForbidden();
        }
        $this->assertDatabaseCount('estagios', 0);
        $this->assertCount(0, Storage::disk('local')->allFiles('documentos'));
    }

    public function test_criacao_continua_bloqueada_para_aluno_professor_e_empresa_sem_vinculo(): void
    {
        $semVinculo = Usuario::factory()->create(['perfil' => UserRole::EMPRESA]);
        foreach ([$this->alunoUser, $this->professorUser, $semVinculo] as $usuario) {
            $this->actingAs($usuario, 'sanctum')->post('/api/estagios', array_replace($this->payload, [
                'cargo' => 'Desenvolvimento', 'termo_formalizado' => UploadedFile::fake()->create('termo.pdf', 10, 'application/pdf'),
            ]), ['Accept' => 'application/json'])->assertForbidden();
        }
        $this->assertDatabaseCount('estagios', 0);
        $this->assertCount(0, Storage::disk('local')->allFiles('documentos'));
    }
}

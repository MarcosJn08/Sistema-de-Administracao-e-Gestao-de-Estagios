<?php

namespace Tests\Feature;

use App\Enums\ModalidadeEstagio;
use App\Enums\StatusConvenio;
use App\Enums\StatusCurso;
use App\Enums\StatusEstagio;
use App\Events\EstagioCanceladoDesvioFuncaoEvent;
use App\Models\Aluno;
use App\Models\Curso;
use App\Models\EmpresaConcedente;
use App\Models\Estagio;
use App\Models\FrequenciaDiariaCampo;
use App\Models\ProfessorOrientador;
use App\Models\SupervisorEmpresa;
use App\Models\Turma;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Event;
use Tests\TestCase;

class FrequenciaCampoControllerTest extends TestCase
{
    use RefreshDatabase;

    private User $professorUser;
    private ProfessorOrientador $professor;
    private User $alunoUser;
    private Aluno $aluno;
    private Estagio $estagio;
    private Curso $curso;

    protected function setUp(): void
    {
        parent::setUp();

        $this->curso = Curso::create([
            'nome' => 'Técnico em Enfermagem',
            'codigo' => 'ENF',
            'modalidade' => 'tecnico',
            'carga_horaria_estagio' => 160,
            'horas_minimas_estagio' => 160,
            'modalidade_estagio' => 'supervisionado_campo',
            'status' => StatusCurso::ATIVO,
        ]);

        $turma = Turma::create([
            'curso_id' => $this->curso->id,
            'nome' => 'Turma ENF 2026',
            'ano' => 2026,
            'semestre' => 1,
            'turno' => 'matutino',
        ]);

        $this->professorUser = User::create([
            'nome' => 'Professora Enfermagem',
            'email' => 'prof.enf@ifnmg.edu.br',
            'password' => bcrypt('password123'),
            'role' => 'professor',
            'status' => 'ativo',
        ]);

        $this->professor = ProfessorOrientador::create([
            'usuario_id' => $this->professorUser->id,
            'siape_matricula' => '1234567',
            'departamento_area' => 'Saúde',
            'titulacao' => 'Mestrado',
            'telefone' => '38999990001',
        ]);

        $this->alunoUser = User::create([
            'nome' => 'Estudante Enfermagem',
            'email' => 'estudante@aluno.ifnmg.edu.br',
            'password' => bcrypt('password123'),
            'role' => 'aluno',
            'status' => 'ativo',
        ]);

        $this->aluno = Aluno::create([
            'usuario_id' => $this->alunoUser->id,
            'turma_id' => $turma->id,
            'matricula' => '2026ENF001',
            'cpf' => '12345678901',
            'curso_nome' => 'Técnico em Enfermagem',
        ]);

        $empresa = EmpresaConcedente::create([
            'cnpj' => '12345678000199',
            'razao_social' => 'Hospital Regional Almenara',
            'endereco_completo' => 'Av. Hospitalar, 100 - Centro, Almenara - MG',
            'representante_legal' => 'Dr. Diretor Hospitalar',
            'status_convenio' => StatusConvenio::ATIVO,
        ]);

        $supervisor = SupervisorEmpresa::create([
            'empresa_concedente_id' => $empresa->id,
            'nome' => 'Enfermeira Chefe',
            'cargo' => 'Supervisora',
            'formacao' => 'Enfermagem',
            'telefone' => '38999990002',
            'email' => 'chefe@hospital.com',
        ]);

        $this->estagio = Estagio::create([
            'aluno_id' => $this->aluno->id,
            'empresa_concedente_id' => $empresa->id,
            'professor_orientador_id' => $this->professor->id,
            'supervisor_empresa_id' => $supervisor->id,
            'modalidade' => ModalidadeEstagio::SUPERVISIONADO_CAMPO,
            'data_inicio' => now()->subDays(10)->toDateString(),
            'data_termino' => now()->addDays(30)->toDateString(),
            'carga_horaria_diaria' => 6.0,
            'status' => StatusEstagio::EM_ANDAMENTO,
        ]);
    }

    public function test_docente_pode_listar_turmas_e_estagiarios_de_campo(): void
    {
        $this->actingAs($this->professorUser, 'sanctum');

        $response = $this->getJson('/api/supervisao-campo/turmas');

        $response->assertOk()
            ->assertJsonPath('success', true)
            ->assertJsonStructure([
                'data' => [
                    '*' => [
                        'turma_id',
                        'turma_nome',
                        'curso',
                        'estagiarios' => [
                            '*' => [
                                'estagio_id',
                                'aluno_id',
                                'nome',
                                'matricula',
                                'empresa',
                                'carga_horaria_diaria',
                                'horas_cumpridas',
                                'horas_exigidas',
                                'horas_restantes',
                            ],
                        ],
                    ],
                ],
            ]);
    }

    public function test_docente_pode_lancar_presenca_e_horas_em_lote_com_baixa_imediata(): void
    {
        $this->actingAs($this->professorUser, 'sanctum');

        $payload = [
            'data' => now()->toDateString(),
            'registros' => [
                [
                    'aluno_id' => $this->aluno->id,
                    'estagio_id' => $this->estagio->id,
                    'presente' => true,
                    'horas_cumpridas' => 6.0,
                    'observacoes' => 'Prática no setor de triagem',
                ],
            ],
        ];

        $response = $this->postJson('/api/supervisao-campo/frequencia-diaria', $payload);

        $response->assertStatus(201)
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.0.horas_cumpridas', 6);

        $this->assertDatabaseHas('frequencias_diarias_campo', [
            'estagio_id' => $this->estagio->id,
            'aluno_id' => $this->aluno->id,
            'presente' => true,
            'horas_cumpridas' => 6.0,
        ]);

        $this->assertEquals(6.0, $this->estagio->fresh()->horasCumpridas());
        $this->assertEquals(154.0, $this->aluno->fresh()->cargaHorariaRestante());
    }

    public function test_bloqueia_lancamento_com_horas_acima_do_limite_diario(): void
    {
        $this->actingAs($this->professorUser, 'sanctum');

        $payload = [
            'data' => now()->toDateString(),
            'registros' => [
                [
                    'aluno_id' => $this->aluno->id,
                    'estagio_id' => $this->estagio->id,
                    'presente' => true,
                    'horas_cumpridas' => 8.0,
                ],
            ],
        ];

        $response = $this->postJson('/api/supervisao-campo/frequencia-diaria', $payload);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['horas_cumpridas']);
    }

    public function test_cancelamento_preserva_extrato_de_campo_e_bloqueia_novos_lancamentos(): void
    {
        Event::fake([EstagioCanceladoDesvioFuncaoEvent::class]);
        $this->actingAs($this->professorUser, 'sanctum');

        $rotaLancamento = '/api/supervisao-campo/frequencia-diaria';
        $rotaHistorico = '/api/supervisao-campo/historico-aluno/'.$this->aluno->id;
        $lancamento = [
            'data' => today()->subDay()->toDateString(),
            'registros' => [[
                'aluno_id' => $this->aluno->id,
                'estagio_id' => $this->estagio->id,
                'presente' => true,
                'horas_cumpridas' => 3.5,
            ]],
        ];
        $registroId = $this->postJson($rotaLancamento, $lancamento)
            ->assertCreated()->assertJsonPath('data.0.saldo_atualizado', 3.5)->json('data.0.id');
        $this->getJson($rotaHistorico)->assertOk()
            ->assertJsonPath('data.aluno.total_horas_campo', 3.5)
            ->assertJsonPath('data.aluno.saldo_restante', 156.5);

        $this->postJson('/api/estagios/'.$this->estagio->id.'/cancelar-desvio-funcao', [
            'justificativa_pedagogica' => 'As atividades de campo executadas são incompatíveis com o PPC.',
        ])->assertOk()->assertJsonPath('data.status', 'CANCELADO_DESVIO_FUNCAO');

        $this->postJson($rotaLancamento, array_replace($lancamento, ['data' => today()->toDateString()]))
            ->assertUnprocessable()->assertJsonValidationErrors('estagio');
        $this->getJson($rotaHistorico)->assertOk()
            ->assertJsonCount(1, 'data.extrato')
            ->assertJsonPath('data.extrato.0.id', $registroId)
            ->assertJsonPath('data.extrato.0.horas_cumpridas', 3.5)
            ->assertJsonPath('data.aluno.total_horas_campo', 3.5)
            ->assertJsonPath('data.aluno.saldo_restante', 160);
        $this->getJson('/api/orientador/meus-discentes')->assertOk()
            ->assertJsonPath('data.0.estagios.0.id', $this->estagio->id)
            ->assertJsonPath('data.0.estagios.0.status', 'CANCELADO_DESVIO_FUNCAO')
            ->assertJsonPath('data.0.estagios.0.horas_cumpridas', 3.5);
        $this->assertDatabaseCount('frequencias_diarias_campo', 1);
        Event::assertDispatchedTimes(EstagioCanceladoDesvioFuncaoEvent::class, 1);
    }

    public function test_extrato_historico_aluno_retorna_corretamente(): void
    {
        FrequenciaDiariaCampo::create([
            'estagio_id' => $this->estagio->id,
            'aluno_id' => $this->aluno->id,
            'professor_id' => $this->professor->id,
            'data' => now()->subDay()->toDateString(),
            'horas_cumpridas' => 6.0,
            'presente' => true,
            'observacoes' => 'Setor de internação',
        ]);

        $this->actingAs($this->professorUser, 'sanctum');

        $response = $this->getJson("/api/supervisao-campo/historico-aluno/{$this->aluno->id}");

        $response->assertOk()
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.aluno.total_horas_campo', 6)
            ->assertJsonPath('data.aluno.total_presencas', 1)
            ->assertJsonPath('data.extrato.0.horas_cumpridas', 6);
    }
}

<?php

namespace Tests\Feature;

use App\Enums\ModalidadeEstagio;
use App\Enums\StatusConvenio;
use App\Enums\StatusCurso;
use App\Enums\StatusEstagio;
use App\Models\Aluno;
use App\Models\Curso;
use App\Models\EmpresaConcedente;
use App\Models\Estagio;
use App\Models\FrequenciaMensal;
use App\Models\ProfessorOrientador;
use App\Models\SupervisorEmpresa;
use App\Models\Turma;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class FrequenciaMensalControllerTest extends TestCase
{
    use RefreshDatabase;

    private User $alunoUser;
    private Aluno $aluno;
    private User $professorUser;
    private ProfessorOrientador $professor;
    private Estagio $estagio;

    protected function setUp(): void
    {
        parent::setUp();
        Storage::fake('local');

        $curso = Curso::create([
            'nome' => 'Análise e Desenvolvimento de Sistemas',
            'codigo' => 'ADS',
            'modalidade' => 'superior',
            'carga_horaria_estagio' => 200,
            'horas_minimas_estagio' => 200,
            'modalidade_estagio' => 'orientado',
            'status' => StatusCurso::ATIVO,
        ]);

        $turma = Turma::create([
            'curso_id' => $curso->id,
            'nome' => 'ADS 2026',
            'ano' => 2026,
            'semestre' => 1,
            'turno' => 'noturno',
        ]);

        $this->professorUser = User::create([
            'nome' => 'Professor Orientador ADS',
            'email' => 'orientador.ads@ifnmg.edu.br',
            'password' => bcrypt('password123'),
            'role' => 'professor',
            'status' => 'ativo',
        ]);

        $this->professor = ProfessorOrientador::create([
            'usuario_id' => $this->professorUser->id,
            'siape_matricula' => '7654321',
            'departamento_area' => 'Informática',
            'titulacao' => 'Especialização',
            'telefone' => '38999990003',
        ]);

        $this->alunoUser = User::create([
            'nome' => 'Estudante ADS',
            'email' => 'aluno.ads@aluno.ifnmg.edu.br',
            'password' => bcrypt('password123'),
            'role' => 'aluno',
            'status' => 'ativo',
        ]);

        $this->aluno = Aluno::create([
            'usuario_id' => $this->alunoUser->id,
            'turma_id' => $turma->id,
            'matricula' => '2026ADS001',
            'cpf' => '98765432100',
            'curso_nome' => 'Análise e Desenvolvimento de Sistemas',
        ]);

        $empresa = EmpresaConcedente::create([
            'cnpj' => '99887766000155',
            'razao_social' => 'Empresa de Software Vale',
            'endereco_completo' => 'Rua da Inovação, 50 - Almenara - MG',
            'representante_legal' => 'Sócio Administrador',
            'status_convenio' => StatusConvenio::ATIVO,
        ]);

        $supervisor = SupervisorEmpresa::create([
            'empresa_concedente_id' => $empresa->id,
            'nome' => 'Gerente de TI',
            'cargo' => 'Gerente',
            'formacao' => 'Engenharia de Software',
            'telefone' => '38999990004',
            'email' => 'gerente@software.com',
        ]);

        $this->estagio = Estagio::create([
            'aluno_id' => $this->aluno->id,
            'empresa_concedente_id' => $empresa->id,
            'professor_orientador_id' => $this->professor->id,
            'supervisor_empresa_id' => $supervisor->id,
            'modalidade' => ModalidadeEstagio::ORIENTADO,
            'data_inicio' => now()->subMonths(2)->startOfMonth()->toDateString(),
            'data_termino' => now()->addMonths(4)->endOfMonth()->toDateString(),
            'carga_horaria_diaria' => 6.0,
            'status' => StatusEstagio::EM_ANDAMENTO,
        ]);
    }

    public function test_aluno_pode_enviar_folha_mensal_com_arquivo(): void
    {
        $this->actingAs($this->alunoUser, 'sanctum');

        $arquivo = UploadedFile::fake()->create('folha_frequencia_mes.pdf', 200, 'application/pdf');

        $mes = now()->month;
        $ano = now()->year;

        $response = $this->postJson("/api/estagios/{$this->estagio->id}/frequencias-mensais", [
            'mes_competencia' => $mes,
            'ano_competencia' => $ano,
            'total_horas_mes' => 80.0,
            'arquivo' => $arquivo,
        ]);

        $response->assertStatus(201)
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.total_horas_mes', 80)
            ->assertJsonPath('data.status', 'PENDENTE');

        $this->assertDatabaseHas('frequencias_mensais', [
            'estagio_id' => $this->estagio->id,
            'mes_competencia' => $mes,
            'ano_competencia' => $ano,
            'status' => 'PENDENTE',
        ]);
    }

    public function test_rejeita_folha_mensal_fora_da_periodicidade_maxima_de_6_meses(): void
    {
        $this->actingAs($this->alunoUser, 'sanctum');

        $arquivo = UploadedFile::fake()->create('folha_antiga.pdf', 100, 'application/pdf');

        $mesAntigo = now()->subMonths(8);

        $response = $this->postJson("/api/estagios/{$this->estagio->id}/frequencias-mensais", [
            'mes_competencia' => $mesAntigo->month,
            'ano_competencia' => $mesAntigo->year,
            'total_horas_mes' => 60.0,
            'arquivo' => $arquivo,
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['mes_competencia']);
    }

    public function test_orientador_pode_aprovar_folha_e_computar_horas(): void
    {
        $frequencia = FrequenciaMensal::create([
            'estagio_id' => $this->estagio->id,
            'mes_competencia' => now()->month,
            'ano_competencia' => now()->year,
            'total_horas_mes' => 100.0,
            'arquivo_path' => 'fake_folha.pdf',
            'status' => 'PENDENTE',
        ]);

        $this->actingAs($this->professorUser, 'sanctum');

        $response = $this->postJson("/api/frequencias-mensais/{$frequencia->id}/aprovar");

        $response->assertOk()
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.status', 'APROVADO');

        $this->assertDatabaseHas('frequencias_mensais', [
            'id' => $frequencia->id,
            'status' => 'APROVADO',
            'validado_por' => $this->professor->id,
        ]);

        $this->assertEquals(100.0, $this->estagio->fresh()->horasCumpridas());
        $this->assertEquals(100.0, $this->aluno->fresh()->cargaHorariaRestante());
    }

    public function test_listagem_de_frequencias_mensais_do_estagio(): void
    {
        FrequenciaMensal::create([
            'estagio_id' => $this->estagio->id,
            'mes_competencia' => now()->month,
            'ano_competencia' => now()->year,
            'total_horas_mes' => 60.0,
            'arquivo_path' => 'folha.pdf',
            'status' => 'APROVADO',
        ]);

        $this->actingAs($this->alunoUser, 'sanctum');

        $response = $this->getJson("/api/estagios/{$this->estagio->id}/frequencias-mensais");

        $response->assertOk()
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.estagio_id', $this->estagio->id)
            ->assertJsonCount(1, 'data.frequencias');
    }
}

<?php

namespace Tests\Feature;

use App\Enums\ModalidadeEstagio;
use App\Enums\StatusConvenio;
use App\Enums\StatusEstagio;
use App\Models\Aluno;
use App\Models\Curso;
use App\Models\EmpresaConcedente;
use App\Models\Estagio;
use App\Models\ProfessorOrientador;
use App\Models\SupervisorEmpresa;
use App\Models\Turma;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class CursoControllerTest extends TestCase
{
    use RefreshDatabase;

    private function criarDiretor(): User
    {
        return User::factory()->diretor()->create();
    }

    private function criarAluno(): User
    {
        return User::factory()->create();
    }

    public function test_listagem_de_cursos_e_publica_e_retorna_cargas_horarias(): void
    {
        Curso::create([
            'nome' => 'Análise e Desenvolvimento de Sistemas',
            'codigo' => 'ADS',
            'modalidade' => 'Presencial',
            'horas_minimas_estagio' => 200,
            'permite_aproveitamento_projetos' => true,
            'modalidade_estagio' => 'orientado',
        ]);

        $response = $this->getJson('/api/cursos');

        $response->assertOk()
            ->assertJsonStructure([
                'data' => [
                    '*' => [
                        'id',
                        'nome',
                        'codigo',
                        'modalidade',
                        'horas_minimas_estagio',
                        'carga_horaria_estagio',
                        'permite_aproveitamento_projetos',
                        'modalidade_estagio',
                        'status',
                    ],
                ],
            ])
            ->assertJsonFragment([
                'nome' => 'Análise e Desenvolvimento de Sistemas',
                'horas_minimas_estagio' => 200,
            ]);
    }

    public function test_diretor_pode_cadastrar_novo_curso_com_parametros(): void
    {
        $diretor = $this->criarDiretor();
        Sanctum::actingAs($diretor);

        $payload = [
            'nome' => 'Técnico em Informática',
            'codigo' => 'TEC-INFO',
            'modalidade' => 'Presencial',
            'horas_minimas_estagio' => 160,
            'permite_aproveitamento_projetos' => false,
            'modalidade_estagio' => 'orientado',
        ];

        $response = $this->postJson('/api/cursos', $payload);

        $response->assertCreated()
            ->assertJsonFragment([
                'nome' => 'Técnico em Informática',
                'horas_minimas_estagio' => 160,
                'permite_aproveitamento_projetos' => false,
            ]);

        $this->assertDatabaseHas('cursos', [
            'nome' => 'Técnico em Informática',
            'horas_minimas_estagio' => 160,
            'carga_horaria_estagio' => 160,
        ]);
    }

    public function test_usuario_nao_diretor_nao_pode_cadastrar_curso(): void
    {
        $aluno = $this->criarAluno();
        Sanctum::actingAs($aluno);

        $payload = [
            'nome' => 'Enfermagem',
            'horas_minimas_estagio' => 160,
        ];

        $response = $this->postJson('/api/cursos', $payload);

        $response->assertForbidden();
    }

    public function test_detalhes_do_curso(): void
    {
        $curso = Curso::create([
            'nome' => 'Agronomia',
            'codigo' => 'AGRO',
            'horas_minimas_estagio' => 300,
            'modalidade' => 'Presencial',
            'modalidade_estagio' => 'supervisionado_campo',
        ]);

        $response = $this->getJson("/api/cursos/{$curso->id}");

        $response->assertOk()
            ->assertJsonFragment([
                'id' => $curso->id,
                'nome' => 'Agronomia',
                'horas_minimas_estagio' => 300,
            ]);
    }

    public function test_diretor_pode_atualizar_curso(): void
    {
        $diretor = $this->criarDiretor();
        Sanctum::actingAs($diretor);

        $curso = Curso::create([
            'nome' => 'Agropecuária',
            'codigo' => 'AGROP',
            'horas_minimas_estagio' => 160,
        ]);

        $payload = [
            'nome' => 'Técnico em Agropecuária',
            'modalidade' => 'Presencial',
            'horas_minimas_estagio' => 200,
            'permite_aproveitamento_projetos' => true,
        ];

        $response = $this->putJson("/api/cursos/{$curso->id}", $payload);

        $response->assertOk()
            ->assertJsonFragment([
                'nome' => 'Técnico em Agropecuária',
                'horas_minimas_estagio' => 200,
                'permite_aproveitamento_projetos' => true,
            ]);

        $this->assertDatabaseHas('cursos', [
            'id' => $curso->id,
            'nome' => 'Técnico em Agropecuária',
            'horas_minimas_estagio' => 200,
        ]);
    }

    public function test_nao_permite_exclusao_de_curso_com_estagios_vinculados(): void
    {
        $diretor = $this->criarDiretor();
        Sanctum::actingAs($diretor);

        $curso = Curso::create([
            'nome' => 'Sistemas de Informação',
            'codigo' => 'BSI',
            'horas_minimas_estagio' => 200,
        ]);

        $turma = Turma::create([
            'curso_id' => $curso->id,
            'nome' => 'Turma BSI 2026',
            'ano' => 2026,
            'semestre' => 1,
            'turno' => 'noturno',
        ]);

        $usuarioAluno = User::factory()->create();
        $aluno = Aluno::create([
            'usuario_id' => $usuarioAluno->id,
            'turma_id' => $turma->id,
            'matricula' => '2026BSI001',
            'cpf' => '12345678901',
        ]);

        $empresa = EmpresaConcedente::create([
            'razao_social' => 'Tech Corp',
            'cnpj' => '12345678000199',
            'endereco_completo' => 'Rua A',
            'representante_legal' => 'João',
            'status_convenio' => StatusConvenio::ATIVO,
        ]);

        $supervisor = SupervisorEmpresa::create([
            'empresa_concedente_id' => $empresa->id,
            'nome' => 'Carlos Silva',
            'email' => 'carlos@empresa.com',
            'cargo' => 'Gerente',
            'formacao' => 'Engenharia de Software',
            'telefone' => '38999990000',
        ]);

        $usuarioProf = User::factory()->professor()->create();
        $orientador = ProfessorOrientador::create([
            'usuario_id' => $usuarioProf->id,
            'siape_matricula' => '7891234',
            'departamento_area' => 'TI',
            'max_orientados' => 5,
        ]);

        Estagio::create([
            'aluno_id' => $aluno->id,
            'empresa_concedente_id' => $empresa->id,
            'professor_orientador_id' => $orientador->id,
            'supervisor_empresa_id' => $supervisor->id,
            'modalidade' => ModalidadeEstagio::ORIENTADO,
            'data_inicio' => now(),
            'data_termino' => now()->addMonths(6),
            'carga_horaria_diaria' => 6,
            'status' => StatusEstagio::EM_ANDAMENTO,
        ]);

        $response = $this->deleteJson("/api/cursos/{$curso->id}");

        $response->assertUnprocessable()
            ->assertJsonValidationErrors(['curso']);

        $this->assertDatabaseHas('cursos', [
            'id' => $curso->id,
            'deleted_at' => null,
        ]);
    }

    public function test_permite_exclusao_logica_de_curso_sem_estagios(): void
    {
        $diretor = $this->criarDiretor();
        Sanctum::actingAs($diretor);

        $curso = Curso::create([
            'nome' => 'Curso Sem Estagios',
            'codigo' => 'CSE',
            'horas_minimas_estagio' => 100,
        ]);

        $response = $this->deleteJson("/api/cursos/{$curso->id}");

        $response->assertOk()
            ->assertJsonFragment([
                'message' => 'Curso excluído com sucesso.',
            ]);

        $this->assertSoftDeleted('cursos', [
            'id' => $curso->id,
        ]);
    }
}

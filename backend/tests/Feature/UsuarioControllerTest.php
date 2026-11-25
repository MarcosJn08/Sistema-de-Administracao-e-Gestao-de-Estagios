<?php

namespace Tests\Feature;

use App\Enums\UserRole;
use App\Models\Aluno;
use App\Models\Curso;
use App\Models\Turma;
use App\Models\Usuario;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class UsuarioControllerTest extends TestCase
{
    use RefreshDatabase;

    private Usuario $diretor;
    private Usuario $aluno;

    protected function setUp(): void
    {
        parent::setUp();

        $this->diretor = Usuario::factory()->create([
            'perfil'    => UserRole::DIRETOR,
            'role'      => 'diretor',
            'status'    => 'ativo',
            'is_active' => true,
            'siape'     => '1000001',
        ]);

        $this->aluno = Usuario::factory()->create([
            'perfil'    => UserRole::ALUNO,
            'role'      => 'aluno',
            'status'    => 'ativo',
            'is_active' => true,
            'matricula' => '20261001',
            'cpf'       => '11122233344',
        ]);
    }

    public function test_diretor_can_list_users_with_pagination_and_filters(): void
    {
        $professor = Usuario::factory()->create([
            'perfil'    => UserRole::PROFESSOR,
            'role'      => 'professor',
            'nome'      => 'Prof. Silva Teste',
            'status'    => 'ativo',
            'is_active' => true,
            'siape'     => '2000002',
        ]);

        // Listagem geral
        $response = $this->actingAs($this->diretor, 'sanctum')
            ->getJson('/api/usuarios?per_page=10')
            ->assertOk()
            ->assertJsonStructure(['data', 'links', 'meta']);

        $this->assertGreaterThanOrEqual(3, count($response->json('data')));

        // Filtro por perfil
        $this->actingAs($this->diretor, 'sanctum')
            ->getJson('/api/usuarios?perfil=PROFESSOR')
            ->assertOk()
            ->assertJsonFragment(['nome' => 'Prof. Silva Teste'])
            ->assertJsonMissing(['nome' => $this->aluno->nome]);

        // Busca textual
        $this->actingAs($this->diretor, 'sanctum')
            ->getJson('/api/usuarios?busca=Silva')
            ->assertOk()
            ->assertJsonFragment(['nome' => 'Prof. Silva Teste']);

        // Busca por matrícula
        $this->actingAs($this->diretor, 'sanctum')
            ->getJson('/api/usuarios?busca=20261001')
            ->assertOk()
            ->assertJsonFragment(['email' => $this->aluno->email]);
    }

    public function test_diretor_can_filter_users_by_curso(): void
    {
        $curso = Curso::create([
            'nome' => 'Sistemas de Informação',
            'codigo' => 'SI01',
            'carga_horaria_estagio' => 400,
            'status' => 'ativo',
        ]);

        $turma = Turma::create([
            'curso_id' => $curso->id,
            'nome' => 'Turma SI 2026',
            'ano' => 2026,
            'semestre' => 1,
            'status' => 'ativa',
        ]);

        Aluno::create([
            'usuario_id' => $this->aluno->id,
            'turma_id' => $turma->id,
            'matricula' => $this->aluno->matricula,
            'cpf' => '111.222.333-44',
        ]);

        $this->actingAs($this->diretor, 'sanctum')
            ->getJson('/api/usuarios?curso=Sistemas')
            ->assertOk()
            ->assertJsonFragment(['id' => $this->aluno->id]);

        $this->actingAs($this->diretor, 'sanctum')
            ->getJson('/api/usuarios?curso=Direito')
            ->assertOk()
            ->assertJsonMissing(['id' => $this->aluno->id]);
    }

    public function test_diretor_can_create_user_with_role_and_institutional_identifier(): void
    {
        $payload = [
            'nome'      => 'Novo Aluno Teste',
            'email'     => 'aluno.novo@aluno.ifnmg.edu.br',
            'password'  => 'SenhaForte123!',
            'perfil'    => 'ALUNO',
            'matricula' => '20269999',
            'cpf'       => '999.888.777-66',
        ];

        $response = $this->actingAs($this->diretor, 'sanctum')
            ->postJson('/api/usuarios', $payload)
            ->assertCreated()
            ->assertJsonPath('data.nome', 'Novo Aluno Teste')
            ->assertJsonPath('data.perfil', 'ALUNO')
            ->assertJsonPath('data.matricula', '20269999');

        $this->assertDatabaseHas('usuarios', [
            'email'     => 'aluno.novo@aluno.ifnmg.edu.br',
            'matricula' => '20269999',
            'cpf'       => '99988877766',
        ]);
    }

    public function test_diretor_can_view_and_update_user(): void
    {
        // Visualizar
        $this->actingAs($this->diretor, 'sanctum')
            ->getJson("/api/usuarios/{$this->aluno->id}")
            ->assertOk()
            ->assertJsonPath('data.id', $this->aluno->id);

        // Atualizar
        $this->actingAs($this->diretor, 'sanctum')
            ->putJson("/api/usuarios/{$this->aluno->id}", [
                'nome' => 'Nome Atualizado do Aluno',
            ])
            ->assertOk()
            ->assertJsonPath('data.nome', 'Nome Atualizado do Aluno');

        $this->assertDatabaseHas('usuarios', [
            'id'   => $this->aluno->id,
            'nome' => 'Nome Atualizado do Aluno',
        ]);
    }

    public function test_diretor_can_soft_delete_user_and_cannot_delete_self(): void
    {
        // Soft delete de outro usuário
        $this->actingAs($this->diretor, 'sanctum')
            ->deleteJson("/api/usuarios/{$this->aluno->id}")
            ->assertOk()
            ->assertJsonPath('success', true);

        // Registro ainda existe com deleted_at preenchido e status inativo
        $this->assertSoftDeleted('usuarios', ['id' => $this->aluno->id]);
        $this->assertDatabaseHas('usuarios', [
            'id'     => $this->aluno->id,
            'status' => 'inativo',
        ]);

        // Não pode inativar a própria conta
        $this->actingAs($this->diretor, 'sanctum')
            ->deleteJson("/api/usuarios/{$this->diretor->id}")
            ->assertForbidden();
    }

    public function test_non_director_cannot_access_user_management(): void
    {
        $this->actingAs($this->aluno, 'sanctum')
            ->getJson('/api/usuarios')
            ->assertForbidden();

        $this->actingAs($this->aluno, 'sanctum')
            ->postJson('/api/usuarios', [
                'nome'     => 'Hacker',
                'email'    => 'hacker@ifnmg.edu.br',
                'password' => 'Senha1234!',
                'perfil'   => 'DIRETOR',
            ])
            ->assertForbidden();
    }
}

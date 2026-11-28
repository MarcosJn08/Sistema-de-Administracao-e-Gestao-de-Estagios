<?php

namespace Tests\Feature;

use App\Models\Aluno;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class PerfilAlunoFichaTest extends TestCase
{
    use RefreshDatabase;

    public function test_profile_pdf_document_review_and_candidacy_gate(): void
    {
        Storage::fake('local');
        $user = User::factory()->create();
        $aluno = Aluno::create(['usuario_id' => $user->id, 'matricula' => $user->matricula, 'cpf' => $user->cpf]);
        Sanctum::actingAs($user);

        $this->postJson('/api/aluno/candidaturas', ['vaga_id' => '1', 'vaga' => 'Estágio', 'empresa' => 'Empresa', 'carta_apresentacao' => 'Quero participar.'])
            ->assertUnprocessable();

        $dados = [
            'naturalidade' => 'Almenara', 'uf_naturalidade' => 'MG', 'data_nascimento' => '2004-01-01', 'filiacao' => 'Família Exemplo',
            'estado_civil' => 'Solteiro', 'sexo' => 'Feminino', 'identidade' => '12345', 'orgao_expedidor' => 'SSP', 'telefone' => '38999999999',
            'logradouro' => 'Rua das Flores', 'numero' => '12', 'bairro' => 'Centro', 'cidade' => 'Almenara', 'uf' => 'MG', 'cep' => '39900000',
            'serie_modulo_periodo' => '4º', 'turno' => 'Noturno',
        ];
        $this->patchJson('/api/aluno/perfil', $dados)->assertOk()->assertJsonPath('data.checklist.percentual', 67);
        $this->assertSame('Rua das Flores', $aluno->fresh()->dados_perfil['logradouro']);
        $pdf = $this->get('/api/aluno/ficha-matricula/pdf')->assertOk()->assertHeader('Content-Type', 'application/pdf');
        $this->assertStringStartsWith('%PDF-', $pdf->getContent());

        $this->post('/api/aluno/ficha-matricula', ['arquivo' => UploadedFile::fake()->create('ficha.pdf', 30, 'application/pdf')])->assertCreated();
        $this->postJson('/api/aluno/ficha-matricula/enviar')->assertOk()->assertJsonPath('data.status', 'EM_ANALISE');
        $this->postJson('/api/aluno/candidaturas', ['vaga_id' => '1', 'vaga' => 'Estágio', 'empresa' => 'Empresa', 'carta_apresentacao' => 'Quero participar.'])
            ->assertCreated();
        $this->assertDatabaseHas('candidaturas_vaga', ['aluno_id' => $aluno->id, 'vaga_id' => '1']);
    }
}

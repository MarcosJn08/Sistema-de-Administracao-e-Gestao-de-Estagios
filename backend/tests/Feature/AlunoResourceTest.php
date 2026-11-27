<?php

namespace Tests\Feature;

use App\Models\Estagio;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class AlunoResourceTest extends TestCase
{
    use RefreshDatabase;

    public function test_me_returns_academic_data_and_only_signed_hours_of_authenticated_student(): void
    {
        $estagio = Estagio::factory()->create();
        $outro = Estagio::factory()->create();
        $estagio->frequencias()->create(['data' => today(), 'hora_entrada' => '08:00', 'hora_saida' => '12:00', 'horas_diarias' => 4, 'assinado_supervisor' => true]);
        $estagio->frequencias()->create(['data' => today()->addDay(), 'hora_entrada' => '08:00', 'hora_saida' => '12:00', 'horas_diarias' => 4, 'assinado_supervisor' => false]);
        $outro->frequencias()->create(['data' => today(), 'hora_entrada' => '08:00', 'hora_saida' => '12:00', 'horas_diarias' => 4, 'assinado_supervisor' => true]);
        Sanctum::actingAs($estagio->aluno->usuario);
        $this->getJson('/api/auth/me')->assertOk()
            ->assertJsonPath('data.formacao.curso', $estagio->curso->nome)
            ->assertJsonPath('data.formacao.matricula', $estagio->aluno->matricula)
            ->assertJsonPath('data.formacao.periodo', $estagio->aluno->turma->nome)
            ->assertJsonPath('data.progresso.horas_cumpridas', 4)
            ->assertJsonPath('data.progresso.meta_horas', 400);
    }
}

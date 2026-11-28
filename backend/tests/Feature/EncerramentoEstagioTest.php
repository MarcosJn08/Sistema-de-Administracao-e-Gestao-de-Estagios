<?php

namespace Tests\Feature;

use App\Enums\StatusEstagio;
use App\Events\EstagioCanceladoDesvioFuncaoEvent;
use App\Models\Estagio;
use App\Models\ProfessorOrientador;
use App\Models\User;
use App\Notifications\EstagioCanceladoDesvioFuncaoNotification;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Event;
use Illuminate\Support\Facades\Notification;
use PHPUnit\Framework\Attributes\DataProvider;
use Tests\TestCase;

class EncerramentoEstagioTest extends TestCase
{
    use RefreshDatabase;

    private const PARECER = 'As atividades executadas são incompatíveis com o PPC do curso.';

    public static function estadosQuePermitemCancelamento(): array
    {
        return [
            'em análise' => [StatusEstagio::EM_ANALISE],
            'em andamento' => [StatusEstagio::EM_ANDAMENTO],
        ];
    }

    #[DataProvider('estadosQuePermitemCancelamento')]
    public function test_linked_advisor_cancels_with_audited_opinion_and_one_event_after_commit(StatusEstagio $estado): void
    {
        Event::fake([EstagioCanceladoDesvioFuncaoEvent::class]);
        $estagio = Estagio::factory()->create(['status' => $estado]);
        $orientador = $estagio->orientador->usuario;
        $rota = $this->rota($estagio, 'cancelar-desvio-funcao');

        DB::transaction(function () use ($estagio, $estado, $orientador, $rota): void {
            $this->actingAs($orientador, 'sanctum')->postJson($rota, ['justificativa_pedagogica' => self::PARECER])
                ->assertOk()
                ->assertJsonPath('data.id', $estagio->id)
                ->assertJsonPath('data.status', 'CANCELADO_DESVIO_FUNCAO')
                ->assertJsonPath('data.motivo_encerramento', self::PARECER);
            $this->assertDatabaseHas('historico_estagios', [
                'estagio_id' => $estagio->id,
                'usuario_id' => $orientador->id,
                'status_anterior' => $estado->value,
                'status_novo' => 'CANCELADO_DESVIO_FUNCAO',
                'motivo' => self::PARECER,
            ]);
            Event::assertNotDispatched(EstagioCanceladoDesvioFuncaoEvent::class);
        });

        $encerradoEm = $estagio->refresh()->encerrado_em;
        $this->assertNotNull($encerradoEm);
        Event::assertDispatched(EstagioCanceladoDesvioFuncaoEvent::class, fn ($evento) => $evento->estagio->is($estagio)
            && $evento->autor->is($orientador)
            && $evento->estagio->motivo_encerramento === self::PARECER);

        $this->postJson($rota, ['justificativa_pedagogica' => 'Novo texto enviado em uma segunda tentativa.'])
            ->assertOk()->assertJsonPath('data.motivo_encerramento', self::PARECER);
        $this->assertEquals($encerradoEm, $estagio->refresh()->encerrado_em);
        $this->assertDatabaseCount('historico_estagios', 1);
        Event::assertDispatchedTimes(EstagioCanceladoDesvioFuncaoEvent::class, 1);
    }

    public function test_director_cancels_an_unassigned_stage_and_notifies_the_student_once(): void
    {
        Notification::fake();
        $estagio = Estagio::factory()->create(['status' => StatusEstagio::EM_ANALISE, 'professor_orientador_id' => null]);
        $diretor = User::factory()->diretor()->create();
        $aluno = $estagio->aluno->usuario;
        $rota = $this->rota($estagio, 'cancelar-desvio-funcao');
        $dados = ['justificativa_pedagogica' => self::PARECER];

        $this->actingAs($diretor, 'sanctum')->postJson($rota, $dados)
            ->assertOk()->assertJsonPath('data.status', 'CANCELADO_DESVIO_FUNCAO');
        $this->postJson($rota, $dados)->assertOk();

        $this->assertDatabaseHas('historico_estagios', [
            'estagio_id' => $estagio->id,
            'usuario_id' => $diretor->id,
            'status_anterior' => 'EM_ANALISE',
        ]);
        $this->assertDatabaseCount('historico_estagios', 1);
        Notification::assertSentToTimes($aluno, EstagioCanceladoDesvioFuncaoNotification::class, 1);
        Notification::assertSentTo($aluno, EstagioCanceladoDesvioFuncaoNotification::class,
            fn ($notificacao, $canais) => $notificacao->estagioId === $estagio->id && $canais === ['mail']);
        $this->getJson('/api/orientadores')->assertOk()
            ->assertJsonPath('data.discentes_sem_orientador.0.estagios.0.id', $estagio->id)
            ->assertJsonPath('data.discentes_sem_orientador.0.estagios.0.status', 'CANCELADO_DESVIO_FUNCAO');
    }

    #[DataProvider('estadosQuePermitemCancelamento')]
    public function test_unrelated_advisor_and_student_cannot_cancel_a_stage(StatusEstagio $estado): void
    {
        Event::fake([EstagioCanceladoDesvioFuncaoEvent::class]);
        $estagio = Estagio::factory()->create(['status' => $estado]);
        $outroOrientador = ProfessorOrientador::factory()->create()->usuario;
        $rota = $this->rota($estagio, 'cancelar-desvio-funcao');
        $dados = ['justificativa_pedagogica' => self::PARECER];

        $this->postJson($rota, $dados)->assertUnauthorized();
        $this->actingAs($outroOrientador, 'sanctum')->postJson($rota, $dados)->assertForbidden();
        $this->actingAs($estagio->aluno->usuario, 'sanctum')->postJson($rota, $dados)->assertForbidden();
        $this->assertSame($estado, $estagio->refresh()->status);
        $this->assertDatabaseCount('historico_estagios', 0);
        Event::assertNotDispatched(EstagioCanceladoDesvioFuncaoEvent::class);
    }

    public function test_pedagogical_opinion_is_required_for_a_stage_under_review(): void
    {
        $estagio = Estagio::factory()->create(['status' => StatusEstagio::EM_ANALISE]);
        $diretor = User::factory()->diretor()->create();
        $rota = $this->rota($estagio, 'cancelar-desvio-funcao');
        $this->actingAs($diretor, 'sanctum');

        foreach ([[], ['justificativa_pedagogica' => '   '], ['justificativa_pedagogica' => str_repeat('a', 19)], [
            'justificativa_pedagogica' => str_repeat('a', 2001),
        ]] as $dados) {
            $this->postJson($rota, $dados)->assertUnprocessable()->assertJsonValidationErrors('justificativa_pedagogica');
        }
        $this->assertSame(StatusEstagio::EM_ANALISE, $estagio->refresh()->status);
        $this->assertDatabaseCount('historico_estagios', 0);
    }

    public function test_cancellation_rejects_new_transitions_from_draft_or_final_states(): void
    {
        Event::fake([EstagioCanceladoDesvioFuncaoEvent::class]);
        $this->actingAs(User::factory()->diretor()->create(), 'sanctum');

        foreach ([StatusEstagio::RASCUNHO, StatusEstagio::CONCLUIDO, StatusEstagio::ENCERRADO] as $estado) {
            $estagio = Estagio::factory()->create(['status' => $estado]);
            $this->postJson($this->rota($estagio, 'cancelar-desvio-funcao'), ['justificativa_pedagogica' => self::PARECER])
                ->assertUnprocessable()->assertJsonValidationErrors('status');
            $this->assertSame($estado, $estagio->refresh()->status);
        }

        $this->assertDatabaseCount('historico_estagios', 0);
        Event::assertNotDispatched(EstagioCanceladoDesvioFuncaoEvent::class);
    }

    public function test_director_can_cancel_a_stage_under_review_through_the_status_route(): void
    {
        Event::fake([EstagioCanceladoDesvioFuncaoEvent::class]);
        $estagio = Estagio::factory()->create(['status' => StatusEstagio::EM_ANALISE]);
        $diretor = User::factory()->diretor()->create();

        $this->actingAs($diretor, 'sanctum')->patchJson($this->rota($estagio, 'status'), [
            'status' => 'CANCELADO_DESVIO_FUNCAO',
            'motivo' => self::PARECER,
        ])->assertOk()->assertJsonPath('data.status', 'CANCELADO_DESVIO_FUNCAO');
        Event::assertDispatchedTimes(EstagioCanceladoDesvioFuncaoEvent::class, 1);
    }

    public function test_rollback_preserves_stage_and_suppresses_event_and_notification(): void
    {
        Notification::fake();
        $estagio = Estagio::factory()->create(['status' => StatusEstagio::EM_ANDAMENTO]);

        DB::beginTransaction();
        try {
            $this->actingAs($estagio->orientador->usuario, 'sanctum')
                ->postJson($this->rota($estagio, 'cancelar-desvio-funcao'), ['justificativa_pedagogica' => self::PARECER])
                ->assertOk();
            Notification::assertNothingSent();
        } finally {
            DB::rollBack();
        }

        $this->assertSame(StatusEstagio::EM_ANDAMENTO, $estagio->refresh()->status);
        $this->assertDatabaseCount('historico_estagios', 0);
        Notification::assertNothingSent();
    }

    public function test_administrative_closure_requires_a_director_and_formal_reason(): void
    {
        Event::fake([EstagioCanceladoDesvioFuncaoEvent::class]);
        $estagio = Estagio::factory()->create(['status' => StatusEstagio::EM_ANALISE]);
        $rota = $this->rota($estagio, 'encerrar');
        $dados = ['motivo' => 'Encerramento do convênio registrado pela Direção.'];

        $this->actingAs($estagio->orientador->usuario, 'sanctum')->postJson($rota, $dados)->assertForbidden();

        $diretor = User::factory()->diretor()->create();
        $this->actingAs($diretor, 'sanctum')->postJson($rota, ['motivo' => '   '])
            ->assertUnprocessable()->assertJsonValidationErrors('motivo');
        $this->postJson($rota, $dados)->assertOk()->assertJsonPath('data.status', 'ENCERRADO');
        $this->postJson($rota, $dados)->assertOk();
        $this->patchJson('/api/estagios/'.$estagio->id.'/status', ['status' => 'ENCERRADO'])
            ->assertUnprocessable()->assertJsonValidationErrors('motivo');
        $this->postJson($this->rota($estagio, 'cancelar-desvio-funcao'), ['justificativa_pedagogica' => self::PARECER])
            ->assertUnprocessable()->assertJsonValidationErrors('status');

        $this->assertNotNull($estagio->refresh()->encerrado_em);
        $this->assertDatabaseHas('historico_estagios', [
            'estagio_id' => $estagio->id,
            'usuario_id' => $diretor->id,
            'status_anterior' => 'EM_ANALISE',
            'status_novo' => 'ENCERRADO',
            'motivo' => $dados['motivo'],
        ]);
        $this->assertDatabaseCount('historico_estagios', 1);
        Event::assertNotDispatched(EstagioCanceladoDesvioFuncaoEvent::class);
    }

    private function rota(Estagio $estagio, string $acao): string
    {
        return '/api/estagios/'.$estagio->id.'/'.$acao;
    }
}

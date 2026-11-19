<?php

namespace Tests\Feature;

use App\Jobs\EnviarEmailRecuperacaoSenhaJob;
use App\Mail\RecuperacaoSenhaMail;
use App\Models\User;
use Illuminate\Foundation\Testing\LazilyRefreshDatabase;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Password;
use Illuminate\Support\Facades\Queue;
use Tests\TestCase;

class EnviarEmailRecuperacaoSenhaJobTest extends TestCase
{
    use LazilyRefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        config([
            'app.key' => 'base64:'.base64_encode(str_repeat('a', 32)),
            'app.frontend_url' => 'http://frontend.local:5173',
        ]);
    }

    public function test_job_envia_link_do_frontend_com_email_e_token(): void
    {
        Mail::fake();
        $usuario = User::factory()->create(['email' => 'aluna+ads@aluno.ifnmg.edu.br']);
        $token = Password::broker('users')->createToken($usuario);

        (new EnviarEmailRecuperacaoSenhaJob($usuario, $token))->handle();

        Mail::assertSent(RecuperacaoSenhaMail::class, function ($mail) use ($usuario, $token): bool {
            parse_str(parse_url($mail->url, PHP_URL_QUERY), $parametros);

            return $mail->hasTo($usuario->email)
                && str_starts_with($mail->url, 'http://frontend.local:5173/sage/login?')
                && $parametros['token'] === $token && $parametros['email'] === $usuario->email;
        });
    }

    public function test_job_descarta_link_que_expirou_na_fila(): void
    {
        Mail::fake();
        $this->freezeTime();
        $usuario = User::factory()->create(['email' => 'aluna@aluno.ifnmg.edu.br']);
        $token = Password::broker('users')->createToken($usuario);
        $this->travel(61)->minutes();

        (new EnviarEmailRecuperacaoSenhaJob($usuario, $token))->handle();

        Mail::assertNothingSent();
    }

    public function test_job_descarta_token_que_ja_foi_consumido(): void
    {
        Mail::fake();
        $usuario = User::factory()->create(['email' => 'aluna@aluno.ifnmg.edu.br']);
        $token = Password::broker('users')->createToken($usuario);
        Password::broker('users')->deleteToken($usuario);

        (new EnviarEmailRecuperacaoSenhaJob($usuario, $token))->handle();

        Mail::assertNothingSent();
    }

    public function test_fila_database_protege_token_e_executa_envio(): void
    {
        Mail::fake();
        $usuario = User::factory()->create(['email' => 'aluna@aluno.ifnmg.edu.br']);
        $token = Password::broker('users')->createToken($usuario);
        $fila = Queue::connection('database');
        $fila->push(new EnviarEmailRecuperacaoSenhaJob($usuario, $token));
        $payload = DB::table('jobs')->value('payload');

        $this->assertStringNotContainsString($token, $payload);
        $job = $fila->pop();
        $job->fire();

        Mail::assertSent(RecuperacaoSenhaMail::class);
        $this->assertDatabaseCount('jobs', 0);
    }

    public function test_email_renderiza_instrucao_link_e_prazo_em_html_e_texto(): void
    {
        $email = new RecuperacaoSenhaMail('http://frontend.local:5173/sage/login?token=teste&email=aluna%40aluno.ifnmg.edu.br');

        $email->assertSeeInHtml('Redefinir senha');
        $email->assertSeeInText('60 minutos');
        $email->assertSeeInText('uma única vez');
    }
}

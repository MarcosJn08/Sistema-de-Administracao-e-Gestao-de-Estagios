<?php

namespace Tests\Feature;

use App\Jobs\EnviarEmailRecuperacaoSenhaJob;
use App\Models\User;
use Illuminate\Auth\Events\PasswordReset;
use Illuminate\Foundation\Testing\LazilyRefreshDatabase;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Event;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Password;
use Illuminate\Support\Facades\Queue;
use PHPUnit\Framework\Attributes\DataProvider;
use PHPUnit\Framework\Attributes\TestWith;
use Tests\TestCase;

class PasswordResetControllerTest extends TestCase
{
    use LazilyRefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        config(['app.key' => 'base64:'.base64_encode(str_repeat('a', 32))]);
    }

    #[TestWith(['aluna@aluno.ifnmg.edu.br', 'aluna@aluno.ifnmg.edu.br'])]
    #[TestWith(['docente@ifnmg.edu.br', 'docente@ifnmg.edu.br'])]
    #[TestWith(['Pessoa+ads@ALUNO.IFNMG.EDU.BR', '  pessoa+ads@aluno.ifnmg.edu.br  '])]
    #[TestWith(['usuario@gmail.com', 'usuario@gmail.com'])]
    #[TestWith(['empresa@techsolutions.com.br', '  empresa@techsolutions.com.br '])]
    public function test_solicitacao_publica_guarda_token_com_hash_e_encaminha_job(string $cadastrado, string $informado): void
    {
        Queue::fake();
        $usuario = $this->usuario(['email' => $cadastrado]);

        $resposta = $this->postJson('/api/auth/esqueci-senha', ['email' => $informado]);

        $resposta->assertOk()->assertExactJson([
            'success' => true,
            'message' => 'Se houver uma conta com esse e-mail, você receberá um link para redefinir a senha.',
            'data' => null,
            'errors' => [],
        ]);
        Queue::assertPushed(EnviarEmailRecuperacaoSenhaJob::class, function ($job) use ($usuario): bool {
            $armazenado = DB::table('password_reset_tokens')->where('email', $usuario->email)->value('token');

            return $job->usuario->is($usuario) && Hash::check($job->token, $armazenado);
        });
        $this->assertDatabaseCount('password_reset_tokens', 1);
    }

    public function test_email_institucional_nao_cadastrado_recebe_resposta_generica(): void
    {
        Queue::fake();

        $this->postJson('/api/auth/esqueci-senha', ['email' => 'ausente@ifnmg.edu.br'])
            ->assertOk()
            ->assertJsonPath('message', 'Se houver uma conta com esse e-mail, você receberá um link para redefinir a senha.');

        Queue::assertNothingPushed();
        $this->assertDatabaseCount('password_reset_tokens', 0);
    }

    #[TestWith(['email-invalido'])]
    #[TestWith([''])]
    #[TestWith(['@dominio.com'])]
    #[TestWith(['sem-arroba.com'])]
    public function test_retorna_422_para_email_invalido(string $email): void
    {
        Queue::fake();

        $this->postJson('/api/auth/esqueci-senha', ['email' => $email])
            ->assertUnprocessable()->assertJsonValidationErrors('email');

        Queue::assertNothingPushed();
        $this->assertDatabaseCount('password_reset_tokens', 0);
    }

    public function test_solicitacao_repetida_preserva_token_recente_e_envia_um_job(): void
    {
        Queue::fake();
        $usuario = $this->usuario();
        $this->postJson('/api/auth/esqueci-senha', ['email' => $usuario->email])->assertOk();
        $hashInicial = DB::table('password_reset_tokens')->value('token');

        $this->postJson('/api/auth/esqueci-senha', ['email' => $usuario->email])->assertOk();

        Queue::assertPushed(EnviarEmailRecuperacaoSenhaJob::class, 1);
        $this->assertDatabaseHas('password_reset_tokens', ['email' => $usuario->email, 'token' => $hashInicial]);
    }

    public function test_nova_solicitacao_apos_intervalo_invalida_o_token_anterior(): void
    {
        Queue::fake();
        $this->freezeTime();
        $usuario = $this->usuario();
        $antigo = Password::broker('users')->createToken($usuario);
        $this->travel(61)->seconds();

        $this->postJson('/api/auth/esqueci-senha', ['email' => $usuario->email])->assertOk();

        $this->assertFalse(Password::broker('users')->tokenExists($usuario, $antigo));
        Queue::assertPushed(EnviarEmailRecuperacaoSenhaJob::class, fn ($job): bool => $job->token !== $antigo);
    }

    public function test_redefine_senha_sem_login_remove_token_e_rotaciona_remember_token(): void
    {
        $usuario = $this->usuario(['remember_token' => 'token-anterior']);
        $token = Password::broker('users')->createToken($usuario);
        Event::fake([PasswordReset::class]);

        $this->postJson('/api/auth/redefinir-senha', $this->dadosReset($usuario, $token))
            ->assertOk()->assertJsonPath('success', true);

        $usuario->refresh();
        $this->assertTrue(Hash::check('NovaSenha123!', $usuario->password));
        $this->assertFalse(Hash::check('SenhaAntiga123!', $usuario->password));
        $this->assertNotSame('token-anterior', $usuario->remember_token);
        $this->assertDatabaseMissing('password_reset_tokens', ['email' => $usuario->email]);
        Event::assertDispatched(PasswordReset::class, fn ($evento): bool => $evento->user->is($usuario));
    }

    public function test_token_continua_valido_antes_dos_60_minutos(): void
    {
        $this->freezeTime();
        $usuario = $this->usuario();
        $token = Password::broker('users')->createToken($usuario);
        $this->travel(59)->minutes();

        $this->postJson('/api/auth/redefinir-senha', $this->dadosReset($usuario, $token))->assertOk();

        $this->assertTrue(Hash::check('NovaSenha123!', $usuario->fresh()->password));
    }

    public function test_retorna_422_para_token_expirado_e_preserva_senha(): void
    {
        $this->freezeTime();
        $usuario = $this->usuario();
        $token = Password::broker('users')->createToken($usuario);
        $this->travel(61)->minutes();

        $this->postJson('/api/auth/redefinir-senha', $this->dadosReset($usuario, $token))
            ->assertUnprocessable()->assertJsonValidationErrors('token');

        $this->assertTrue(Hash::check('SenhaAntiga123!', $usuario->fresh()->password));
    }

    public function test_retorna_422_para_token_invalido_e_preserva_token_valido(): void
    {
        $usuario = $this->usuario();
        $valido = Password::broker('users')->createToken($usuario);

        $this->postJson('/api/auth/redefinir-senha', $this->dadosReset($usuario, str_repeat('z', 64)))
            ->assertUnprocessable()
            ->assertJsonPath('errors.token.0', 'O link de recuperação é inválido ou expirou. Solicite um novo link.');

        $this->assertTrue(Hash::check('SenhaAntiga123!', $usuario->fresh()->password));
        $this->assertTrue(Password::broker('users')->tokenExists($usuario, $valido));
    }

    public function test_token_de_um_usuario_nao_redefine_a_senha_de_outro(): void
    {
        $usuario = $this->usuario();
        $outro = $this->usuario(['email' => 'outro@ifnmg.edu.br']);
        $token = Password::broker('users')->createToken($usuario);

        $this->postJson('/api/auth/redefinir-senha', $this->dadosReset($outro, $token))
            ->assertUnprocessable()->assertJsonValidationErrors('token');

        $this->assertTrue(Hash::check('SenhaAntiga123!', $outro->fresh()->password));
        $this->assertTrue(Password::broker('users')->tokenExists($usuario, $token));
    }

    public function test_token_so_pode_ser_utilizado_uma_vez(): void
    {
        $usuario = $this->usuario();
        $token = Password::broker('users')->createToken($usuario);
        $this->postJson('/api/auth/redefinir-senha', $this->dadosReset($usuario, $token))->assertOk();

        $this->postJson('/api/auth/redefinir-senha', $this->dadosReset($usuario, $token, [
            'password' => 'OutraSenha123!', 'password_confirmation' => 'OutraSenha123!',
        ]))->assertUnprocessable()->assertJsonValidationErrors('token');

        $this->assertTrue(Hash::check('NovaSenha123!', $usuario->fresh()->password));
    }

    public function test_retorna_422_quando_usuario_da_redefinicao_nao_existe(): void
    {
        $this->postJson('/api/auth/redefinir-senha', [
            'email' => 'ausente@ifnmg.edu.br', 'token' => str_repeat('a', 64),
            'password' => 'NovaSenha123!', 'password_confirmation' => 'NovaSenha123!',
        ])->assertUnprocessable()->assertJsonValidationErrors('token');

        $this->assertDatabaseCount('users', 0);
    }

    #[DataProvider('dadosInvalidos')]
    public function test_retorna_422_para_dados_invalidos_e_preserva_senha(array $alteracoes, string $campo): void
    {
        $usuario = $this->usuario();
        $token = Password::broker('users')->createToken($usuario);

        $this->postJson('/api/auth/redefinir-senha', $this->dadosReset($usuario, $token, $alteracoes))
            ->assertUnprocessable()->assertJsonValidationErrors($campo);

        $this->assertTrue(Hash::check('SenhaAntiga123!', $usuario->fresh()->password));
        $this->assertTrue(Password::broker('users')->tokenExists($usuario, $token));
    }

    public static function dadosInvalidos(): array
    {
        return [
            'senha curta' => [['password' => 'curta', 'password_confirmation' => 'curta'], 'password'],
            'confirmacao diferente' => [['password_confirmation' => 'Diferente123!'], 'password'],
            'confirmacao vazia' => [['password_confirmation' => ''], 'password_confirmation'],
            'senha como lista' => [['password' => ['senha']], 'password'],
            'senha longa' => [['password' => str_repeat('a', 73), 'password_confirmation' => str_repeat('a', 73)], 'password'],
            'senha multibyte longa' => [['password' => str_repeat('á', 37), 'password_confirmation' => str_repeat('á', 37)], 'password'],
            'senha com caractere nulo' => [['password' => "Senha\0Nova123!", 'password_confirmation' => "Senha\0Nova123!"], 'password'],
            'email invalido' => [['email' => 'formato-invalido'], 'email'],
            'token ausente' => [['token' => ''], 'token'],
            'token como lista' => [['token' => ['invalido']], 'token'],
        ];
    }

    public function test_retorna_429_para_excesso_de_solicitacoes(): void
    {
        Queue::fake();

        for ($tentativa = 0; $tentativa < 10; $tentativa++) {
            $this->postJson('/api/auth/esqueci-senha', ['email' => 'ausente@ifnmg.edu.br'])->assertOk();
        }

        $this->postJson('/api/auth/esqueci-senha', ['email' => 'ausente@ifnmg.edu.br'])->assertTooManyRequests();

        Queue::assertNothingPushed();
    }

    private function usuario(array $alteracoes = []): User
    {
        return User::factory()->create(array_replace([
            'email' => 'aluna@aluno.ifnmg.edu.br',
            'password' => 'SenhaAntiga123!',
        ], $alteracoes));
    }

    private function dadosReset(User $usuario, string $token, array $alteracoes = []): array
    {
        return array_replace([
            'email' => $usuario->email,
            'token' => $token,
            'password' => 'NovaSenha123!',
            'password_confirmation' => 'NovaSenha123!',
        ], $alteracoes);
    }
}

<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Socialite\Contracts\User as SocialiteUser;
use Laravel\Socialite\Facades\Socialite;
use Mockery;
use Tests\TestCase;

class GoogleAuthControllerTest extends TestCase
{
    use RefreshDatabase;

    protected function tearDown(): void
    {
        Mockery::close();
        parent::tearDown();
    }

    public function test_redirect_retorna_url_ou_redirecionamento_oauth(): void
    {
        $response = $this->getJson('/api/auth/google/redirect');

        $response->assertOk()
            ->assertJsonStructure(['success', 'url'])
            ->assertJson(['success' => true]);

        $this->assertStringContainsString('accounts.google.com', $response->json('url'));
    }

    public function test_callback_rejeita_dominio_nao_institucional(): void
    {
        $googleUser = Mockery::mock(SocialiteUser::class);
        $googleUser->shouldReceive('getEmail')->andReturn('usuario@gmail.com');
        $googleUser->shouldReceive('getName')->andReturn('Fulano Gmail');

        $provider = Mockery::mock('Laravel\Socialite\Two\GoogleProvider');
        $provider->shouldReceive('stateless')->andReturnSelf();
        $provider->shouldReceive('user')->andReturn($googleUser);

        Socialite::shouldReceive('driver')->with('google')->andReturn($provider);

        $response = $this->postJson('/api/auth/google/callback', ['code' => 'valid-mock-code']);

        $response->assertStatus(422)
            ->assertJsonPath('success', false)
            ->assertJsonValidationErrors(['email']);
    }

    public function test_callback_autentica_e_provisiona_aluno_com_email_aluno_ifnmg(): void
    {
        $googleUser = Mockery::mock(SocialiteUser::class);
        $googleUser->shouldReceive('getEmail')->andReturn('joao.silva@aluno.ifnmg.edu.br');
        $googleUser->shouldReceive('getName')->andReturn('João Silva');

        $provider = Mockery::mock('Laravel\Socialite\Two\GoogleProvider');
        $provider->shouldReceive('stateless')->andReturnSelf();
        $provider->shouldReceive('user')->andReturn($googleUser);

        Socialite::shouldReceive('driver')->with('google')->andReturn($provider);

        $response = $this->postJson('/api/auth/google/callback', ['code' => 'valid-mock-code']);

        $response->assertOk()
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.email', 'joao.silva@aluno.ifnmg.edu.br')
            ->assertJsonPath('data.role', 'aluno')
            ->assertJsonStructure([
                'token',
                'token_type',
                'expires_at',
                'data' => ['id', 'name', 'email', 'role'],
            ]);

        $this->assertDatabaseHas('usuarios', [
            'email' => 'joao.silva@aluno.ifnmg.edu.br',
            'role' => 'aluno',
            'status' => 'ativo',
        ]);
    }

    public function test_callback_autentica_e_provisiona_docente_com_email_servidor_ifnmg(): void
    {
        $googleUser = Mockery::mock(SocialiteUser::class);
        $googleUser->shouldReceive('getEmail')->andReturn('maria.docente@ifnmg.edu.br');
        $googleUser->shouldReceive('getName')->andReturn('Maria Docente');

        $provider = Mockery::mock('Laravel\Socialite\Two\GoogleProvider');
        $provider->shouldReceive('stateless')->andReturnSelf();
        $provider->shouldReceive('user')->andReturn($googleUser);

        Socialite::shouldReceive('driver')->with('google')->andReturn($provider);

        $response = $this->postJson('/api/auth/google/callback', ['code' => 'valid-mock-code']);

        $response->assertOk()
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.email', 'maria.docente@ifnmg.edu.br')
            ->assertJsonPath('data.role', 'professor')
            ->assertJsonStructure(['token', 'token_type', 'expires_at']);

        $this->assertDatabaseHas('usuarios', [
            'email' => 'maria.docente@ifnmg.edu.br',
            'role' => 'professor',
        ]);
    }

    public function test_callback_com_usuario_existente_apenas_autentica_e_gera_token(): void
    {
        $existente = User::create([
            'name' => 'Carlos Professor',
            'nome' => 'Carlos Professor',
            'email' => 'carlos.professor@ifnmg.edu.br',
            'role' => 'professor',
            'password' => bcrypt('SenhaForte123!'),
            'status' => 'ativo',
            'siape' => '9988776',
        ]);

        $googleUser = Mockery::mock(SocialiteUser::class);
        $googleUser->shouldReceive('getEmail')->andReturn('carlos.professor@ifnmg.edu.br');
        $googleUser->shouldReceive('getName')->andReturn('Carlos Professor');

        $provider = Mockery::mock('Laravel\Socialite\Two\GoogleProvider');
        $provider->shouldReceive('stateless')->andReturnSelf();
        $provider->shouldReceive('userFromToken')->with('my-google-token')->andReturn($googleUser);

        Socialite::shouldReceive('driver')->with('google')->andReturn($provider);

        $response = $this->postJson('/api/auth/google/callback', ['token' => 'my-google-token']);

        $response->assertOk()
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.id', $existente->id)
            ->assertJsonPath('data.siape', '9988776')
            ->assertJsonStructure(['token', 'token_type', 'expires_at']);

        $this->assertSame(1, User::where('email', 'carlos.professor@ifnmg.edu.br')->count());
    }

    public function test_callback_rejeita_usuario_inativo(): void
    {
        User::create([
            'name' => 'Aluno Bloqueado',
            'nome' => 'Aluno Bloqueado',
            'email' => 'bloqueado@aluno.ifnmg.edu.br',
            'role' => 'aluno',
            'password' => bcrypt('SenhaForte123!'),
            'status' => 'inativo',
            'is_active' => false,
        ]);

        $googleUser = Mockery::mock(SocialiteUser::class);
        $googleUser->shouldReceive('getEmail')->andReturn('bloqueado@aluno.ifnmg.edu.br');
        $googleUser->shouldReceive('getName')->andReturn('Aluno Bloqueado');

        $provider = Mockery::mock('Laravel\Socialite\Two\GoogleProvider');
        $provider->shouldReceive('stateless')->andReturnSelf();
        $provider->shouldReceive('user')->andReturn($googleUser);

        Socialite::shouldReceive('driver')->with('google')->andReturn($provider);

        $response = $this->postJson('/api/auth/google/callback', ['code' => 'some-code']);

        $response->assertStatus(422)
            ->assertJsonPath('success', false)
            ->assertJsonValidationErrors(['email']);
    }
}

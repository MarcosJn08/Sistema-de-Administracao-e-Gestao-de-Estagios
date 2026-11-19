<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\LazilyRefreshDatabase;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Route;
use Laravel\Sanctum\PersonalAccessToken;
use PHPUnit\Framework\Attributes\DataProvider;
use Tests\TestCase;

class AuthenticationTest extends TestCase
{
    use LazilyRefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        config(['sanctum.expiration' => 120]);

        Route::middleware(['api', 'auth:sanctum', 'account.active', 'role:diretor'])
            ->get('/api/testing/director', fn () => response()->json(['allowed' => true]));
    }

    public function test_authentication_routes_use_the_unversioned_api_prefix(): void
    {
        $this->assertSame('/api/auth/login', route('auth.login', [], false));
        $this->assertSame('/api/auth/me', route('auth.me', [], false));
        $this->assertSame('/api/auth/logout', route('auth.logout', [], false));
    }

    public static function loginIdentifiers(): array
    {
        return [
            'aluno e-mail' => ['aluno', 'email'],
            'aluno matrícula' => ['aluno', 'matricula'],
            'professor e-mail' => ['professor', 'email'],
            'professor SIAPE' => ['professor', 'siape'],
            'diretor e-mail' => ['diretor', 'email'],
            'diretor SIAPE' => ['diretor', 'siape'],
            'empresa e-mail externo' => ['empresa', 'email'],
            'empresa CNPJ' => ['empresa', 'cnpj'],
        ];
    }

    private function createUser(string $role): User
    {
        $factory = User::factory();
        if ($role !== 'aluno') {
            $factory = $factory->{$role}();
        }

        return $factory->create();
    }

    #[DataProvider('loginIdentifiers')]
    public function test_login_accepts_each_identifier_and_returns_only_public_account_data(string $role, string $field): void
    {
        $this->freezeTime();
        $user = $this->createUser($role);

        $response = $this->postJson('/api/auth/login', [
            'identifier' => $user->{$field},
            'password' => 'password',
        ]);

        $response->assertOk()->assertJsonPath('success', true)
            ->assertJsonPath('data.id', $user->id)->assertJsonPath('data.role', $role)
            ->assertJsonMissingPath('data.password')->assertJsonMissingPath('data.remember_token')
            ->assertJsonPath('token_type', 'Bearer')
            ->assertJsonPath('expires_at', now()->addMinutes(120)->toIso8601String())
            ->assertHeaderMissing('Set-Cookie');

        $token = $response->json('token');
        $storedToken = PersonalAccessToken::findToken($token);
        $this->assertNotNull($storedToken);
        $this->assertSame($user->id, $storedToken->tokenable_id);
        $this->assertSame(hash('sha256', explode('|', $token, 2)[1]), $storedToken->token);
        $this->assertNotSame($token, $storedToken->token);
        $this->assertDatabaseCount('personal_access_tokens', 1);
        $this->assertDatabaseCount('sessions', 0);
    }

    public function test_login_normalizes_email_and_preserves_the_password_hash(): void
    {
        $user = User::factory()->create(['email' => 'Aluno@ALUNO.IFNMG.EDU.BR']);

        $this->postJson('/api/auth/login', [
            'identifier' => '  ALUNO@ALUNO.IFNMG.EDU.BR  ',
            'password' => 'password',
        ])->assertOk()->assertJsonPath('data.email', 'aluno@aluno.ifnmg.edu.br');

        $this->assertTrue(Hash::check('password', $user->fresh()->password));
    }

    public function test_formatted_cnpj_is_supported(): void
    {
        User::factory()->empresa()->create(['cnpj' => '11.222.333/0001-81']);

        $this->postJson('/api/auth/login', [
            'identifier' => '11.222.333/0001-81',
            'password' => 'password',
        ])->assertOk()->assertJsonPath('data.cnpj', '11222333000181');
    }

    public function test_matricula_preserves_leading_zeroes(): void
    {
        User::factory()->create(['matricula' => '00123456']);

        $this->postJson('/api/auth/login', [
            'identifier' => '00123456',
            'password' => 'password',
        ])->assertOk()->assertJsonPath('data.matricula', '00123456');
    }

    public function test_wrong_password_and_unknown_account_have_the_same_401_response(): void
    {
        $user = User::factory()->create();

        $wrongPassword = $this->postJson('/api/auth/login', [
            'identifier' => $user->email, 'password' => 'incorrect',
        ]);
        $unknownAccount = $this->postJson('/api/auth/login', [
            'identifier' => 'unknown@aluno.ifnmg.edu.br', 'password' => 'incorrect',
        ]);

        $wrongPassword->assertUnauthorized()->assertJsonPath('message', 'Identificador ou senha inválidos.');
        $unknownAccount->assertUnauthorized()->assertExactJson($wrongPassword->json());
        $this->assertGuest('web');
        $this->assertDatabaseCount('personal_access_tokens', 0);
    }

    public static function invalidDomains(): array
    {
        return [
            'aluno externo' => ['aluno', 'aluno@example.com'],
            'aluno domínio servidor' => ['aluno', 'aluno@ifnmg.edu.br'],
            'professor domínio discente' => ['professor', 'professor@aluno.ifnmg.edu.br'],
            'diretor externo' => ['diretor', 'diretor@example.com'],
            'sufixo malicioso' => ['professor', 'professor@ifnmg.edu.br.example.com'],
        ];
    }

    #[DataProvider('invalidDomains')]
    public function test_invalid_institutional_domains_are_rejected_even_with_valid_passwords(string $role, string $email): void
    {
        $user = $this->createUser($role);
        $user->forceFill(['email' => $email])->save();

        $this->postJson('/api/auth/login', [
            'identifier' => $email, 'password' => 'password',
        ])->assertUnauthorized();

        $this->assertGuest('web');
    }

    public function test_matricula_does_not_bypass_the_email_domain_rule(): void
    {
        $user = User::factory()->create(['email' => 'aluno@example.com']);

        $this->postJson('/api/auth/login', [
            'identifier' => $user->matricula, 'password' => 'password',
        ])->assertUnauthorized();
    }

    public function test_inactive_account_cannot_login(): void
    {
        $user = User::factory()->create(['is_active' => false]);

        $this->postJson('/api/auth/login', [
            'identifier' => $user->email, 'password' => 'password',
        ])->assertUnauthorized();

        $this->assertGuest('web');
    }

    public function test_existing_account_without_assigned_role_cannot_login(): void
    {
        $user = User::factory()->create(['role' => null]);

        $this->postJson('/api/auth/login', [
            'identifier' => $user->email, 'password' => 'password',
        ])->assertUnauthorized();
    }

    public function test_ambiguous_numeric_identifier_fails_closed(): void
    {
        User::factory()->create(['matricula' => '1234567']);
        User::factory()->professor()->create(['siape' => '1234567']);

        $this->postJson('/api/auth/login', [
            'identifier' => '1234567', 'password' => 'password',
        ])->assertUnauthorized();
    }

    public function test_missing_credentials_return_422_with_field_errors(): void
    {
        $this->postJson('/api/auth/login', [])
            ->assertUnprocessable()->assertJsonValidationErrors(['identifier', 'password'])
            ->assertJsonPath('errors.password.0', 'Informe sua senha.');
    }

    public static function invalidIdentifiers(): array
    {
        return [
            'array' => [['aluno']],
            'number instead of string' => [123456],
            'malformed email' => ['aluno@@ifnmg.edu.br'],
            'SQL expression' => ["' OR 1=1 --"],
            'oversized input' => [str_repeat('a', 255)],
        ];
    }

    #[DataProvider('invalidIdentifiers')]
    public function test_invalid_identifier_returns_422(mixed $identifier): void
    {
        $this->postJson('/api/auth/login', [
            'identifier' => $identifier, 'password' => 'password',
        ])->assertUnprocessable()->assertJsonValidationErrors('identifier');
    }

    public function test_client_cannot_choose_its_role(): void
    {
        $user = User::factory()->create();

        $this->postJson('/api/auth/login', [
            'identifier' => $user->email, 'password' => 'password', 'role' => 'diretor',
        ])->assertUnprocessable()->assertJsonValidationErrors('role');

        $this->assertSame('aluno', $user->fresh()->role);
        $this->assertGuest('web');
    }

    public function test_me_and_logout_require_authentication(): void
    {
        $this->getJson('/api/auth/me')->assertUnauthorized()->assertJsonPath('message', 'Não autenticado.');
        $this->postJson('/api/auth/logout')->assertUnauthorized();
        $this->getJson('/api/testing/director')->assertUnauthorized();
    }

    public function test_me_returns_only_the_authenticated_users_identifiers(): void
    {
        $user = User::factory()->professor()->create();
        User::factory()->create();

        $token = $user->createToken('teste')->plainTextToken;

        $this->withToken($token)->getJson('/api/auth/me')
            ->assertOk()->assertHeader('Cache-Control', 'no-store, private')->assertExactJson([
                'data' => [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'role' => 'professor',
                    'siape' => $user->siape,
                ],
                'success' => true,
                'message' => 'Usuário autenticado.',
                'errors' => [],
            ]);
    }

    public function test_logout_revokes_the_current_token_and_me_becomes_unauthorized(): void
    {
        $user = User::factory()->create();
        $response = $this->postJson('/api/auth/login', [
            'identifier' => $user->email, 'password' => 'password',
        ])->assertOk();
        $token = $response->json('token');
        $storedToken = PersonalAccessToken::findToken($token);

        $this->withToken($token)->postJson('/api/auth/logout')->assertNoContent();

        $this->assertDatabaseMissing('personal_access_tokens', ['id' => $storedToken->id]);
        Auth::forgetGuards();
        $this->withToken($token)->getJson('/api/auth/me')->assertUnauthorized();
    }

    public function test_login_does_not_require_origin_cookies_or_csrf(): void
    {
        $user = User::factory()->create();

        $this->postJson('/api/auth/login', [
            'identifier' => $user->email, 'password' => 'password',
        ])->assertOk()->assertJsonStructure(['token', 'expires_at', 'data'])
            ->assertHeaderMissing('Set-Cookie');

        $this->getJson('/api/auth/me')->assertUnauthorized();
    }

    public function test_deactivating_an_account_revokes_access_on_the_next_request(): void
    {
        $user = User::factory()->create();
        $token = $user->createToken('teste')->plainTextToken;
        $user->forceFill(['is_active' => false])->save();

        $this->withToken($token)->getJson('/api/auth/me')->assertUnauthorized();

        $this->assertDatabaseCount('personal_access_tokens', 0);
    }

    public function test_role_middleware_allows_director(): void
    {
        $token = User::factory()->diretor()->create()->createToken('teste')->plainTextToken;

        $this->withToken($token)
            ->getJson('/api/testing/director')->assertOk()->assertJsonPath('allowed', true);
    }

    public static function nonDirectorRoles(): array
    {
        return ['aluno' => ['aluno'], 'professor' => ['professor'], 'empresa' => ['empresa']];
    }

    #[DataProvider('nonDirectorRoles')]
    public function test_role_middleware_refuses_other_profiles_with_403(string $role): void
    {
        $token = $this->createUser($role)->createToken('teste')->plainTextToken;

        $this->withToken($token)
            ->getJson('/api/testing/director')->assertForbidden()
            ->assertJsonPath('message', 'Você não tem permissão para realizar esta ação.');
    }

    public function test_login_is_throttled_and_becomes_available_after_the_window(): void
    {
        $this->freezeTime();
        for ($attempt = 0; $attempt < 5; $attempt++) {
            $this->postJson('/api/auth/login', [
                'identifier' => 'unknown@ifnmg.edu.br', 'password' => 'incorrect',
            ])->assertUnauthorized();
        }

        $this->postJson('/api/auth/login', [
            'identifier' => ' UNKNOWN@IFNMG.EDU.BR ', 'password' => 'incorrect',
        ])->assertTooManyRequests()->assertHeader('Retry-After');

        $this->travel(61)->seconds();
        $this->postJson('/api/auth/login', [
            'identifier' => 'unknown@ifnmg.edu.br', 'password' => 'incorrect',
        ])->assertUnauthorized();
    }

    public function test_session_authentication_does_not_replace_the_bearer_token(): void
    {
        $user = User::factory()->create();

        $this->actingAs($user, 'web')->withSession(['previous' => 'session'])
            ->getJson('/api/auth/me')->assertUnauthorized();
        $this->postJson('/api/auth/logout')->assertUnauthorized();
    }

    public function test_expired_token_is_rejected(): void
    {
        $this->freezeTime();
        $user = User::factory()->create();
        $token = $user->createToken('teste', ['*'], now()->subMinute())->plainTextToken;

        $this->withToken($token)->getJson('/api/auth/me')->assertUnauthorized();
    }

    public function test_token_stops_working_after_its_lifetime(): void
    {
        $this->freezeTime();
        $user = User::factory()->create();
        $response = $this->postJson('/api/auth/login', [
            'identifier' => $user->email, 'password' => 'password',
        ])->assertOk();

        $this->travel(121)->minutes();

        $this->withToken($response->json('token'))->getJson('/api/auth/me')->assertUnauthorized();
    }

    public function test_logout_keeps_other_tokens_and_other_users_authenticated(): void
    {
        $user = User::factory()->create();
        $current = $user->createToken('atual');
        $otherDevice = $user->createToken('outro dispositivo');
        $otherUser = User::factory()->empresa()->create()->createToken('outra conta');

        $this->withToken($current->plainTextToken)->postJson('/api/auth/logout')->assertNoContent();

        $this->assertDatabaseMissing('personal_access_tokens', ['id' => $current->accessToken->id]);
        $this->assertModelExists($otherDevice->accessToken);
        $this->assertModelExists($otherUser->accessToken);
        Auth::forgetGuards();
        $this->withToken($otherDevice->plainTextToken)->getJson('/api/auth/me')
            ->assertOk()->assertJsonPath('data.id', $user->id);
    }

    public function test_each_login_creates_an_independent_token(): void
    {
        $user = User::factory()->create();
        $credentials = ['identifier' => $user->email, 'password' => 'password'];
        $first = $this->postJson('/api/auth/login', $credentials)->assertOk()->json('token');
        $second = $this->postJson('/api/auth/login', $credentials)->assertOk()->json('token');

        $this->assertNotSame($first, $second);
        $this->assertDatabaseCount('personal_access_tokens', 2);
    }

    public function test_token_expiration_can_be_configured(): void
    {
        $this->freezeTime();
        config(['sanctum.expiration' => 30]);
        $user = User::factory()->create();

        $this->postJson('/api/auth/login', [
            'identifier' => $user->email, 'password' => 'password',
        ])->assertOk()->assertJsonPath('expires_at', now()->addMinutes(30)->toIso8601String());
    }

    public function test_unknown_or_tampered_token_is_rejected(): void
    {
        $user = User::factory()->create();
        $token = $user->createToken('teste')->plainTextToken;
        [$id] = explode('|', $token, 2);

        $this->withToken($id.'|invalid-secret')->getJson('/api/auth/me')->assertUnauthorized();
        Auth::forgetGuards();
        $this->withToken('999999|unknown-token')->getJson('/api/auth/me')->assertUnauthorized();
    }

    public function test_account_domain_changes_revoke_access(): void
    {
        $user = User::factory()->professor()->create();
        $token = $user->createToken('teste')->plainTextToken;
        $user->forceFill(['email' => 'professor@example.com'])->save();

        $this->withToken($token)->getJson('/api/auth/me')->assertUnauthorized();

        $this->assertDatabaseCount('personal_access_tokens', 0);
    }

    public function test_cors_accepts_authorization_for_allowed_origins_without_cookies(): void
    {
        $this->options('/api/auth/login', [], [
            'Origin' => 'http://localhost:5173',
            'Access-Control-Request-Method' => 'POST',
            'Access-Control-Request-Headers' => 'Authorization,Content-Type',
        ])->assertNoContent()
            ->assertHeader('Access-Control-Allow-Origin', 'http://localhost:5173')
            ->assertHeaderMissing('Access-Control-Allow-Credentials');

        $this->options('/api/auth/login', [], [
            'Origin' => 'https://untrusted.example',
            'Access-Control-Request-Method' => 'POST',
        ])->assertHeaderMissing('Access-Control-Allow-Origin');
    }
}

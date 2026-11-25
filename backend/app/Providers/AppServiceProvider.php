<?php

namespace App\Providers;

use App\Models\Usuario;
use App\Policies\UserPolicy;
use App\Services\AuthService;
use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    public function register(): void {}

    public function boot(): void
    {
        Gate::policy(Usuario::class, UserPolicy::class);

        RateLimiter::for('login', fn (Request $request) => [Limit::perMinute(20)->by($request->ip()), Limit::perMinute(5)->by(strtolower((string) $request->input('email')).'|'.$request->ip())]);
        RateLimiter::for('api', fn (Request $request) => Limit::perMinute(120)->by($request->user()?->id ?: $request->ip()));
        RateLimiter::for('auth-login', function (Request $request): array {
            $identifier = $request->input('identifier');
            $identifier = is_string($identifier) ? AuthService::normalizeIdentifier($identifier) : '';

            return [
                Limit::perMinute(30)->by('login-ip:'.$request->ip()),
                Limit::perMinute(5)->by('login:'.hash('sha256', $identifier.'|'.$request->ip())),
            ];
        });
    }
}

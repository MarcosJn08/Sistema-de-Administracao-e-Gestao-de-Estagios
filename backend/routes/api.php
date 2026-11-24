<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\PasswordResetController;
use Illuminate\Support\Facades\Route;

Route::prefix('auth')->name('auth.')->group(function (): void {
    Route::post('/login', [AuthController::class, 'login'])
        ->middleware('throttle:auth-login')->name('login');

    Route::middleware('throttle:10,1')->name('password.')->group(function (): void {
        Route::post('/esqueci-senha', [PasswordResetController::class, 'esqueciSenha'])->name('forgot');
        Route::post('/redefinir-senha', [PasswordResetController::class, 'redefinirSenha'])->name('reset');
    });

    Route::middleware('auth:sanctum')->group(function (): void {
        Route::post('/logout', [AuthController::class, 'logout'])->name('logout');
        Route::get('/me', [AuthController::class, 'me'])
            ->middleware('account.active')->name('me');
    });
});

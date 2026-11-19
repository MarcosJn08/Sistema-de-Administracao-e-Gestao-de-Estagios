<?php

use App\Http\Controllers\PasswordResetController;
use Illuminate\Support\Facades\Route;

Route::prefix('auth')->middleware('throttle:10,1')->group(function (): void {
    Route::post('/esqueci-senha', [PasswordResetController::class, 'esqueciSenha'])->name('auth.password.forgot');
    Route::post('/redefinir-senha', [PasswordResetController::class, 'redefinirSenha'])->name('auth.password.reset');
});

Route::get('/status', function () {
    return response()->json([
        'success' => true,
        'message' => 'API funcionando corretamente.',
        'data' => [
            'version' => '1.0.0',
        ],
        'errors' => [],
    ]);
});

Route::get('/teste-erro', function () {
    abort(404);
});

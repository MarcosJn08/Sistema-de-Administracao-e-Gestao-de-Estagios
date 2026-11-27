<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\CursoController;
use App\Http\Controllers\Api\GoogleAuthController;
use App\Http\Controllers\Api\PasswordResetController;
use App\Http\Controllers\Api\UsuarioController;
use App\Http\Controllers\CadastroController;
use App\Http\Controllers\ComplementoEstagioController;
use App\Http\Controllers\ContratoEstagioController;
use App\Http\Controllers\DocumentoController;
use App\Http\Controllers\EstagioController;
use App\Http\Controllers\FrequenciaController;
use App\Http\Controllers\OrientadorEstagioController;
use Illuminate\Support\Facades\Route;

Route::get('/status', fn () => response()->json(['success' => true, 'message' => 'API funcionando corretamente.', 'data' => ['version' => '1.0.0'], 'errors' => []]));

Route::get('/cursos', [CursoController::class, 'index']);
Route::get('/cursos/{curso}', [CursoController::class, 'show']);

Route::prefix('auth')->name('auth.')->group(function (): void {
    Route::post('/login', [AuthController::class, 'login'])
        ->middleware('throttle:auth-login')->name('login');

    Route::prefix('google')->name('google.')->group(function (): void {
        Route::get('/redirect', [GoogleAuthController::class, 'redirect'])->name('redirect');
        Route::match(['get', 'post'], '/callback', [GoogleAuthController::class, 'callback'])->name('callback');
    });

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

Route::middleware(['auth:sanctum', 'ativo', 'throttle:api'])->group(function () {
    Route::post('/cursos', [CursoController::class, 'store']);
    Route::put('/cursos/{curso}', [CursoController::class, 'update']);
    Route::delete('/cursos/{curso}', [CursoController::class, 'destroy']);

    Route::apiResource('usuarios', UsuarioController::class)->except(['index', 'store']);
    Route::get('/usuarios', [UsuarioController::class, 'index']);
    Route::post('/usuarios', [UsuarioController::class, 'store']);

    Route::middleware('account.active')->group(function (): void {
        Route::get('/orientadores', [OrientadorEstagioController::class, 'index'])->middleware('perfil:DIRETOR');
        Route::patch('/estagios/{estagio}/orientador', [OrientadorEstagioController::class, 'vincular'])->whereNumber('estagio');
        Route::get('/orientador/meus-discentes', [OrientadorEstagioController::class, 'meusDiscentes'])->middleware('perfil:PROFESSOR');
    });

    Route::apiResource('estagios', ContratoEstagioController::class)->only(['index', 'store', 'show', 'update']);
    Route::patch('/estagios/{estagio}/status', [EstagioController::class, 'status']);
    Route::get('/estagios/{estagio}/documentos', [DocumentoController::class, 'index']);
    Route::post('/estagios/{estagio}/documentos', [DocumentoController::class, 'store']);
    Route::patch('/estagios/{estagio}/documentos/{documento}/analise', [DocumentoController::class, 'review']);
    Route::get('/estagios/{estagio}/documentos/{documento}/historico', [DocumentoController::class, 'history']);
    Route::get('/estagios/{estagio}/documentos/{documento}/download', [DocumentoController::class, 'download']);
    Route::get('/estagios/{estagio}/frequencias', [FrequenciaController::class, 'index']);
    Route::post('/estagios/{estagio}/frequencias', [FrequenciaController::class, 'store']);
    Route::put('/estagios/{estagio}/frequencias/{frequencia}', [FrequenciaController::class, 'update']);
    Route::post('/estagios/{estagio}/frequencias/{frequencia}/assinatura', [FrequenciaController::class, 'sign']);
    Route::put('/estagios/{estagio}/complementos/{tipo}', [ComplementoEstagioController::class, 'save'])->whereIn('tipo', ['apolice', 'plano', 'salubridade', 'relatorio']);
    Route::post('/estagios/{estagio}/relatorio/aprovacao', [ComplementoEstagioController::class, 'approveReport']);
    Route::put('/estagios/{estagio}/avaliacao', [ComplementoEstagioController::class, 'avaliacao']);
    Route::middleware('perfil:DIRETOR')->group(function () {
        $recursos = ['turmas', 'alunos', 'empresas', 'professores', 'supervisores'];
        Route::get('/{recurso}', [CadastroController::class, 'index'])->whereIn('recurso', $recursos);
        Route::post('/{recurso}', [CadastroController::class, 'store'])->whereIn('recurso', $recursos);
        Route::get('/{recurso}/{id}', [CadastroController::class, 'show'])->whereIn('recurso', $recursos)->whereNumber('id');
        Route::patch('/{recurso}/{id}', [CadastroController::class, 'update'])->whereIn('recurso', $recursos)->whereNumber('id');
    });
});

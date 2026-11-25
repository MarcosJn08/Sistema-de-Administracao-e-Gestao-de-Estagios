<?php

use App\Http\Controllers\AuthController;
use App\Http\Controllers\CadastroController;
use App\Http\Controllers\ComplementoEstagioController;
use App\Http\Controllers\DocumentoController;
use App\Http\Controllers\EstagioController;
use App\Http\Controllers\FrequenciaController;
use Illuminate\Support\Facades\Route;

Route::get('/status', fn () => response()->json(['success' => true, 'message' => 'API funcionando corretamente.', 'data' => ['version' => '1.0.0'], 'errors' => []]));
Route::post('/auth/login', [AuthController::class, 'login'])->middleware('throttle:login');
Route::middleware(['auth:sanctum', 'ativo', 'throttle:api'])->group(function () {
    Route::get('/auth/me', [AuthController::class, 'me']);
    Route::post('/auth/logout', [AuthController::class, 'logout']);
    Route::get('/estagios', [EstagioController::class, 'index']);
    Route::post('/estagios', [EstagioController::class, 'store']);
    Route::get('/estagios/{estagio}', [EstagioController::class, 'show']);
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
        $recursos = ['usuarios', 'cursos', 'turmas', 'alunos', 'empresas', 'professores', 'supervisores'];
        Route::get('/{recurso}', [CadastroController::class, 'index'])->whereIn('recurso', $recursos);
        Route::post('/{recurso}', [CadastroController::class, 'store'])->whereIn('recurso', $recursos);
        Route::get('/{recurso}/{id}', [CadastroController::class, 'show'])->whereIn('recurso', $recursos)->whereNumber('id');
        Route::patch('/{recurso}/{id}', [CadastroController::class, 'update'])->whereIn('recurso', $recursos)->whereNumber('id');
    });
});

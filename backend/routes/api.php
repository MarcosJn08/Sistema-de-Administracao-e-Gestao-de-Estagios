<?php

use Illuminate\Support\Facades\Route;
use Illuminate\Http\Request;

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

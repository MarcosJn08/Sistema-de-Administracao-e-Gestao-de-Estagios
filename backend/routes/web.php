<?php

use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Route;

Route::get('/', function (): JsonResponse {
    return response()->json([
        'success' => true,
        'message' => 'API do SAGE.',
        'data' => ['name' => 'SAGE API'],
        'errors' => [],
    ]);
});

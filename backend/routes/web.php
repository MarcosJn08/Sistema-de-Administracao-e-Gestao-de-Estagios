<?php

use Illuminate\Support\Facades\Route;

Route::get('/', fn () => response()->json(['success' => true, 'message' => 'SAGE API', 'data' => ['version' => '1.0.0'], 'errors' => []]));

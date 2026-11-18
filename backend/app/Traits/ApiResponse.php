<?php

namespace App\Traits;

use Illuminate\Http\JsonResponse;

trait ApiResponse
{
    protected function success(mixed $data, string $message, int $code = 200): JsonResponse
    {
        return $this->successResponse($data, $message, $code);
    }

    protected function error(string $message, int $code = 400, array $errors = []): JsonResponse
    {
        return $this->errorResponse($message, $code, $errors);
    }

    protected function successResponse(
        mixed $data = null,
        string $message = 'Operação realizada com sucesso.',
        int $code = 200
    ): JsonResponse {
        return response()->json([
            'success' => true,
            'message' => $message,
            'data' => $data,
            'errors' => [],
        ], $code);
    }

    protected function errorResponse(
        string $message = 'Ocorreu um erro.',
        int $code = 400,
        array $errors = []
    ): JsonResponse {
        return response()->json([
            'success' => false,
            'message' => $message,
            'errors' => $errors,
        ], $code);
    }
}

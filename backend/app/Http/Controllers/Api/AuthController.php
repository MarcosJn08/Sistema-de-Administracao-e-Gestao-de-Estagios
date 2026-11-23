<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Docs\Auth\AuthDocs;
use App\Http\Requests\LoginRequest;
use App\Http\Resources\UserResource;
use App\Services\AuthService;
use Illuminate\Http\Request;
use Illuminate\Http\Response;

class AuthController extends Controller
{
    use AuthDocs;

    public function __construct(private readonly AuthService $authService) {}

    public function login(LoginRequest $request): UserResource
    {
        $authentication = $this->authService->login(
            $request->validated('identifier'),
            $request->validated('password'),
        );

        return (new UserResource($authentication['user']))->additional([
            'success' => true,
            'message' => 'Autenticação realizada com sucesso.',
            'token' => $authentication['token'],
            'token_type' => 'Bearer',
            'expires_at' => $authentication['expires_at'],
            'errors' => [],
        ]);
    }

    public function me(Request $request): UserResource
    {
        return (new UserResource($request->user()))->additional([
            'success' => true,
            'message' => 'Usuário autenticado.',
            'errors' => [],
        ]);
    }

    public function logout(Request $request): Response
    {
        $this->authService->logout($request);

        return response()->noContent();
    }
}

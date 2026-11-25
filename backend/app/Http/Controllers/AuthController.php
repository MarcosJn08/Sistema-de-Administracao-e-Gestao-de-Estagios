<?php

namespace App\Http\Controllers;

use App\Models\Usuario;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    public function login(Request $request): JsonResponse
    {
        $data = $request->validate(['email' => 'required|email|max:255', 'password' => 'required|string|max:255']);
        $usuario = Usuario::where('email', strtolower($data['email']))->first();
        if (! $usuario || ! Hash::check($data['password'], $usuario->password) || $usuario->status !== 'ativo') {
            throw ValidationException::withMessages(['email' => ['Credenciais inválidas.']]);
        }

        return $this->successResponse(['usuario' => $usuario, 'token' => $usuario->createToken('api', ['*'], now()->addHours(8))->plainTextToken, 'token_type' => 'Bearer', 'expires_in' => 28800]);
    }

    public function me(Request $request): JsonResponse
    {
        return $this->successResponse($request->user()->load('aluno.turma.curso', 'professor'));
    }

    public function logout(Request $request): JsonResponse
    {
        $request->user()->currentAccessToken()?->delete();

        return $this->successResponse(null, 'Sessão encerrada.');
    }
}

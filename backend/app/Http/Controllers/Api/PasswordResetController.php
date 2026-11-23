<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Docs\Auth\PasswordResetDocs;
use App\Http\Requests\ForgotPasswordRequest;
use App\Http\Requests\ResetPasswordRequest;
use App\Services\PasswordResetService;
use Illuminate\Http\JsonResponse;

class PasswordResetController extends Controller
{
    use PasswordResetDocs;

    public function __construct(private readonly PasswordResetService $passwordResetService) {}

    public function esqueciSenha(ForgotPasswordRequest $request): JsonResponse
    {
        $this->passwordResetService->solicitarLink($request->validated('email'));

        return $this->success(null, 'Se houver uma conta com esse e-mail, você receberá um link para redefinir a senha.');
    }

    public function redefinirSenha(ResetPasswordRequest $request): JsonResponse
    {
        $this->passwordResetService->redefinir($request->validated());

        return $this->success(null, 'Senha redefinida com sucesso. Acesse sua conta com a nova senha.');
    }
}

<?php

namespace App\Http\Docs\Auth;

use App\Http\Requests\ForgotPasswordRequest;
use App\Http\Requests\ResetPasswordRequest;
use Illuminate\Http\JsonResponse;
use OpenApi\Attributes as OA;

trait PasswordResetDocs
{
    #[OA\Post(
        path: '/api/auth/esqueci-senha',
        operationId: 'authForgotPassword',
        summary: 'Solicitar recuperação de senha',
        description: 'Somente contas elegíveis recebem o link no e-mail cadastrado. Alunos e servidores usam o e-mail institucional; empresas podem usar e-mail externo. A resposta não revela se a conta existe.',
        security: [],
        tags: ['Autenticação'],
        requestBody: new OA\RequestBody(
            required: true,
            content: new OA\JsonContent(
                required: ['email'],
                properties: [new OA\Property(property: 'email', type: 'string', format: 'email', example: 'aluna@aluno.ifnmg.edu.br')],
                type: 'object'
            )
        ),
        responses: [
            new OA\Response(response: 200, description: 'Solicitação processada sem revelar a existência da conta.', content: new OA\JsonContent(
                example: ['success' => true, 'message' => 'Se houver uma conta com esse e-mail, você receberá um link para redefinir a senha.', 'data' => null, 'errors' => []]
            )),
            new OA\Response(ref: '#/components/responses/ValidationError', response: 422),
            new OA\Response(ref: '#/components/responses/TooManyRequests', response: 429),
        ]
    )]
    abstract public function esqueciSenha(ForgotPasswordRequest $request): JsonResponse;

    #[OA\Post(
        path: '/api/auth/redefinir-senha',
        operationId: 'authResetPassword',
        summary: 'Redefinir senha',
        description: 'O token do e-mail é de uso único e vale 60 minutos. A redefinição revoga os tokens Sanctum da conta.',
        security: [],
        tags: ['Autenticação'],
        requestBody: new OA\RequestBody(
            required: true,
            content: new OA\JsonContent(
                required: ['email', 'token', 'password', 'password_confirmation'],
                properties: [
                    new OA\Property(property: 'email', type: 'string', format: 'email', example: 'aluna@aluno.ifnmg.edu.br'),
                    new OA\Property(property: 'token', type: 'string', maxLength: 255, writeOnly: true),
                    new OA\Property(property: 'password', type: 'string', format: 'password', minLength: 8, writeOnly: true),
                    new OA\Property(property: 'password_confirmation', type: 'string', format: 'password', writeOnly: true),
                ],
                type: 'object'
            )
        ),
        responses: [
            new OA\Response(response: 200, description: 'Senha redefinida e tokens da conta revogados.', content: new OA\JsonContent(
                example: ['success' => true, 'message' => 'Senha redefinida com sucesso. Acesse sua conta com a nova senha.', 'data' => null, 'errors' => []]
            )),
            new OA\Response(ref: '#/components/responses/ValidationError', response: 422),
            new OA\Response(ref: '#/components/responses/TooManyRequests', response: 429),
        ]
    )]
    abstract public function redefinirSenha(ResetPasswordRequest $request): JsonResponse;
}

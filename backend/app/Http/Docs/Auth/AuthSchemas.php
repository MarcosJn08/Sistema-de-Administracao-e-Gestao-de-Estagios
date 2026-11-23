<?php

namespace App\Http\Docs\Auth;

use OpenApi\Attributes as OA;

#[OA\Schema(
    schema: 'LoginRequest',
    required: ['identifier', 'password'],
    properties: [
        new OA\Property(
            property: 'identifier',
            description: 'E-mail, matrícula, SIAPE ou CNPJ. Alunos exigem domínio @aluno.ifnmg.edu.br; professores/diretores, @ifnmg.edu.br. Empresas aceitam e-mail externo. Identificadores numéricos devem ser strings; CNPJ aceita máscara.',
            type: 'string',
            maxLength: 254,
            minLength: 1,
            example: '202600000001'
        ),
        new OA\Property(property: 'password', type: 'string', format: 'password', maxLength: 1024, minLength: 1, writeOnly: true),
    ],
    type: 'object',
    description: 'O perfil é definido pelo banco: o campo role é proibido. Contas inativas, sem perfil ou com domínio incompatível não autenticam.'
)]
#[OA\Schema(
    schema: 'AuthenticatedUser',
    required: ['id', 'name', 'email', 'role'],
    properties: [
        new OA\Property(property: 'id', type: 'integer', example: 1),
        new OA\Property(property: 'name', type: 'string', example: 'Aluno Demonstração'),
        new OA\Property(property: 'email', type: 'string', format: 'email', example: 'aluno.demo@aluno.ifnmg.edu.br'),
        new OA\Property(property: 'role', type: 'string', enum: ['aluno', 'professor', 'diretor', 'empresa'], example: 'aluno'),
        new OA\Property(property: 'matricula', description: 'Presente apenas para aluno.', type: 'string', example: '202600000001'),
        new OA\Property(property: 'siape', description: 'Presente apenas para professor/diretor.', type: 'string', example: '9000001'),
        new OA\Property(property: 'cnpj', description: 'Presente apenas para empresa, sem máscara.', type: 'string', example: '11222333000181'),
    ],
    type: 'object',
    example: [
        'id' => 1,
        'name' => 'Aluno Demonstração',
        'email' => 'aluno.demo@aluno.ifnmg.edu.br',
        'role' => 'aluno',
        'matricula' => '202600000001',
    ],
    oneOf: [
        new OA\Schema(required: ['matricula'], properties: [new OA\Property(property: 'role', enum: ['aluno'])]),
        new OA\Schema(required: ['siape'], properties: [new OA\Property(property: 'role', enum: ['professor', 'diretor'])]),
        new OA\Schema(required: ['cnpj'], properties: [new OA\Property(property: 'role', enum: ['empresa'])]),
    ]
)]
#[OA\Schema(
    schema: 'AuthenticatedUserResponse',
    required: ['success', 'message', 'data', 'errors'],
    properties: [
        new OA\Property(property: 'success', type: 'boolean', enum: [true]),
        new OA\Property(property: 'message', type: 'string', example: 'Usuário autenticado.'),
        new OA\Property(property: 'data', ref: '#/components/schemas/AuthenticatedUser'),
        new OA\Property(property: 'errors', type: 'array', items: new OA\Items(type: 'string'), maxItems: 0, example: []),
    ],
    type: 'object'
)]
#[OA\Schema(
    schema: 'LoginResponse',
    required: ['success', 'message', 'data', 'errors', 'token', 'token_type', 'expires_at'],
    properties: [
        new OA\Property(property: 'success', type: 'boolean', enum: [true]),
        new OA\Property(property: 'message', type: 'string', example: 'Autenticação realizada com sucesso.'),
        new OA\Property(property: 'data', ref: '#/components/schemas/AuthenticatedUser'),
        new OA\Property(property: 'errors', type: 'array', items: new OA\Items(type: 'string'), maxItems: 0, example: []),
        new OA\Property(property: 'token', description: 'Token completo, exibido somente no login. Enviar em Authorization: Bearer <token>.', type: 'string', example: 'ID|TOKEN_RETORNADO_PELO_SANCTUM'),
        new OA\Property(property: 'token_type', type: 'string', enum: ['Bearer']),
        new OA\Property(property: 'expires_at', description: 'Expiração do token; padrão de 120 minutos, configurável por SANCTUM_TOKEN_EXPIRATION.', type: 'string', format: 'date-time', example: '2026-11-18T23:00:00+00:00'),
    ],
    type: 'object'
)]
class AuthSchemas {}

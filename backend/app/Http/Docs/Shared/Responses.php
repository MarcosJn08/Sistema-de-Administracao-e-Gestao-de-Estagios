<?php

namespace App\Http\Docs\Shared;

use OpenApi\Attributes as OA;

#[OA\Schema(
    schema: 'ErrorResponse',
    required: ['success', 'message', 'errors'],
    properties: [
        new OA\Property(property: 'success', type: 'boolean', enum: [false]),
        new OA\Property(property: 'message', type: 'string', example: 'Não autenticado.'),
        new OA\Property(property: 'errors', type: 'array', items: new OA\Items(type: 'string'), maxItems: 0, example: []),
    ],
    type: 'object'
)]
#[OA\Schema(
    schema: 'ValidationErrorResponse',
    required: ['success', 'message', 'errors'],
    properties: [
        new OA\Property(property: 'success', type: 'boolean', enum: [false]),
        new OA\Property(property: 'message', type: 'string', example: 'Os dados informados são inválidos.'),
        new OA\Property(
            property: 'errors',
            type: 'object',
            example: ['identifier' => ['Informe seu e-mail, matrícula, SIAPE ou CNPJ.'], 'password' => ['Informe sua senha.']],
            additionalProperties: new OA\AdditionalProperties(type: 'array', items: new OA\Items(type: 'string'))
        ),
    ],
    type: 'object'
)]
#[OA\Response(
    response: 'Unauthorized',
    description: 'Token ausente, inválido, expirado ou revogado.',
    content: new OA\JsonContent(ref: '#/components/schemas/ErrorResponse')
)]
#[OA\Response(
    response: 'Forbidden',
    description: 'A conta autenticada não possui permissão para realizar esta ação.',
    content: new OA\JsonContent(
        ref: '#/components/schemas/ErrorResponse',
        example: ['success' => false, 'message' => 'Você não tem permissão para realizar esta ação.', 'errors' => []]
    )
)]
#[OA\Response(
    response: 'ValidationError',
    description: 'Entrada inválida. O objeto errors contém as mensagens agrupadas por campo.',
    content: new OA\JsonContent(ref: '#/components/schemas/ValidationErrorResponse')
)]
#[OA\Response(
    response: 'TooManyRequests',
    description: 'Limite de requisições excedido. Aguarde o intervalo indicado no cabeçalho Retry-After.',
    headers: [
        new OA\Header(header: 'Retry-After', description: 'Tempo de espera em segundos.', schema: new OA\Schema(type: 'integer', minimum: 0)),
    ],
    content: new OA\JsonContent(
        ref: '#/components/schemas/ErrorResponse',
        example: ['success' => false, 'message' => 'Muitas tentativas. Aguarde um minuto antes de tentar novamente.', 'errors' => []]
    )
)]
class Responses {}

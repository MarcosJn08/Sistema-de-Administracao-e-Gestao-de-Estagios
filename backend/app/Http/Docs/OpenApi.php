<?php

namespace App\Http\Docs;

use OpenApi\Attributes as OA;

#[OA\Info(
    version: '1.0.0',
    title: 'SAGE API',
    description: 'Sistema de Administração e Gestão de Estágios. Autenticação por Personal Access Token do Sanctum, não JWT. As URLs não possuem segmento de versão.'
)]
#[OA\Server(url: '/', description: 'Servidor que hospeda esta documentação')]
#[OA\Tag(name: 'Autenticação', description: 'Login, consulta da conta autenticada e revogação do token atual.')]
#[OA\SecurityScheme(
    securityScheme: 'bearerAuth',
    type: 'http',
    description: 'Cole apenas o token retornado no login. O Swagger adiciona o prefixo Bearer. Não são necessários cookies ou CSRF.',
    scheme: 'bearer'
)]
class OpenApi {}

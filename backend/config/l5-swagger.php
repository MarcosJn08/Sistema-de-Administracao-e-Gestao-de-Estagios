<?php

use App\Http\Middleware\EnsureDocumentationIsAvailable;

return [
    'enabled' => env('API_DOCS_ENABLED', in_array(env('APP_ENV', 'production'), ['local', 'testing'], true)),
    'default' => 'default',
    'documentations' => [
        'default' => [
            'api' => ['title' => 'SAGE — Documentação da API'],
            'routes' => ['api' => 'api/documentation'],
            'paths' => [
                'use_absolute_path' => false,
                'swagger_ui_assets_path' => 'vendor/swagger-api/swagger-ui/dist/',
                'docs_json' => 'api-docs.json',
                'docs_yaml' => 'api-docs.yaml',
                'format_to_use_for_docs' => 'json',
                'annotations' => [
                    app_path('Http/Docs'),
                    app_path('Http/Controllers/Api'),
                ],
            ],
        ],
    ],
    'defaults' => [
        'routes' => [
            'docs' => 'api/docs',
            'oauth2_callback' => 'api/documentation/oauth2-callback',
            'middleware' => [
                'api' => [],
                'asset' => [],
                'docs' => [],
                'oauth2_callback' => [],
            ],
            'group_options' => [
                'middleware' => [EnsureDocumentationIsAvailable::class],
            ],
        ],
        'paths' => [
            'docs' => storage_path('api-docs'),
            'views' => resource_path('views/vendor/l5-swagger'),
            'base' => null,
            'excludes' => [],
        ],
        'scanOptions' => [
            'mode' => 'classic',
            'open_api_spec_version' => '3.0.3',
        ],
        'securityDefinitions' => [
            'securitySchemes' => [],
            'security' => [],
        ],
        'generate_always' => env('L5_SWAGGER_GENERATE_ALWAYS', false),
        'generate_yaml_copy' => true,
        'proxy' => false,
        'additional_config_url' => null,
        'operations_sort' => 'alpha',
        'validator_url' => null,
        'ui' => [
            'display' => [
                'doc_expansion' => 'list',
                'filter' => true,
            ],
            'authorization' => [
                'persist_authorization' => false,
                'oauth2' => [
                    'use_pkce_with_authorization_code_grant' => false,
                ],
            ],
        ],
        'constants' => [],
    ],
];

<?php

return [

    'stateful' => [],

    'guard' => [],

    'expiration' => max(1, (int) env('SANCTUM_TOKEN_EXPIRATION', 120)),

    'token_prefix' => env('SANCTUM_TOKEN_PREFIX', ''),

];

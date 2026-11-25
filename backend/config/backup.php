<?php

return [
    'enabled' => (bool) env('BACKUP_ENABLED', false),
    'path' => storage_path('app/backups'),
];

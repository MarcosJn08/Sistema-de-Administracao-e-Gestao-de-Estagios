<?php

use Illuminate\Support\Facades\Schedule;

Schedule::command('sanctum:prune-expired --hours=24')->daily()->withoutOverlapping();
if (config('backup.enabled')) {
    Schedule::command('sage:backup')->dailyAt('02:00')->timezone('America/Sao_Paulo')->withoutOverlapping();
}

<?php

namespace App\Models;

class Usuario extends User
{
    public function getMorphClass(): string
    {
        return User::class;
    }
}

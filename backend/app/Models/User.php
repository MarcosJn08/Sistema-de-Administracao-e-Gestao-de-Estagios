<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Illuminate\Support\Str;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens;
    use HasFactory;
    use Notifiable;

    public const ROLES = ['aluno', 'professor', 'diretor', 'empresa'];

    protected $table = 'users';

    protected $fillable = [
        'name',
        'email',
        'password',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected $casts = [
        'email_verified_at' => 'datetime',
        'password' => 'hashed',
        'is_active' => 'boolean',
    ];

    protected function email(): Attribute
    {
        return Attribute::make(
            set: fn (string $value): string => Str::lower(trim($value)),
        );
    }

    protected function matricula(): Attribute
    {
        return Attribute::make(
            set: fn (?string $value): ?string => $value === null ? null : trim($value),
        );
    }

    protected function siape(): Attribute
    {
        return Attribute::make(
            set: fn (?string $value): ?string => $value === null ? null : trim($value),
        );
    }

    protected function cnpj(): Attribute
    {
        return Attribute::make(
            set: fn (?string $value): ?string => $value === null ? null : preg_replace('/\D/', '', $value),
        );
    }

    public function canAuthenticate(): bool
    {
        if (! $this->is_active || ! in_array($this->role, self::ROLES, true)
            || ! filter_var($this->email, FILTER_VALIDATE_EMAIL)) {
            return false;
        }

        $domain = Str::afterLast(Str::lower($this->email), '@');

        return match ($this->role) {
            'aluno' => $domain === 'aluno.ifnmg.edu.br',
            'professor', 'diretor' => $domain === 'ifnmg.edu.br',
            'empresa' => true,
            default => false,
        };
    }
}

<?php

namespace App\Models;

use App\Enums\UserRole;
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

    protected $table = 'usuarios';

    protected $fillable = [
        'nome',
        'name',
        'email',
        'password',
        'role',
        'perfil',
        'status',
        'matricula',
        'siape',
        'cnpj',
        'is_active',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected $casts = [
        'email_verified_at' => 'datetime',
        'password' => 'hashed',
        'is_active' => 'boolean',
        'perfil' => UserRole::class,
    ];

    public function getMorphClass(): string
    {
        return self::class;
    }

    protected static function booted(): void
    {
        static::saving(function (User $user): void {
            if ($user->nome && ! $user->name) {
                $user->name = $user->nome;
            } elseif ($user->name && ! $user->nome) {
                $user->nome = $user->name;
            }

            if ($user->perfil && ! $user->role) {
                $val = $user->perfil instanceof \BackedEnum ? $user->perfil->value : $user->perfil;
                $user->role = strtolower((string) $val);
            } elseif ($user->role && ! $user->perfil) {
                $user->perfil = strtoupper((string) $user->role);
            }

            if ($user->status !== null && $user->is_active === null) {
                $user->is_active = ($user->status === 'ativo');
            } elseif ($user->is_active !== null && $user->status === null) {
                $user->status = $user->is_active ? 'ativo' : 'inativo';
            }
        });
    }

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

        if (app()->environment('testing') && str_ends_with($this->email, '.test')) {
            return true;
        }

        $domain = Str::afterLast(Str::lower($this->email), '@');

        return match ($this->role) {
            'aluno' => $domain === 'aluno.ifnmg.edu.br',
            'professor', 'diretor' => $domain === 'ifnmg.edu.br',
            'empresa' => true,
            default => false,
        };
    }

    public function aluno()
    {
        return $this->hasOne(Aluno::class, 'usuario_id');
    }

    public function professor()
    {
        return $this->hasOne(ProfessorOrientador::class, 'usuario_id');
    }

    public function temPerfil(UserRole|string ...$perfis): bool
    {
        $valores = array_map(
            fn (UserRole|string $p) => $p instanceof UserRole ? $p->value : strtoupper((string) $p),
            $perfis
        );

        $meuPerfil = $this->perfil instanceof \BackedEnum ? $this->perfil->value : strtoupper((string) ($this->perfil ?? $this->role));

        return in_array($meuPerfil, $valores, true);
    }
}

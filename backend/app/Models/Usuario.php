<?php

namespace App\Models;

use App\Enums\UserRole;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class Usuario extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;

    protected $table = 'usuarios';
    protected $fillable = ['nome', 'email', 'password', 'perfil', 'status'];
    protected $hidden = ['password', 'remember_token'];

    protected $casts = [
        'password' => 'hashed',
        'perfil'   => UserRole::class,
    ];

    public function aluno()      { return $this->hasOne(Aluno::class); }
    public function professor()  { return $this->hasOne(ProfessorOrientador::class); }

    // Aceita o enum ou o texto: temPerfil(UserRole::DIRETOR) ou temPerfil('DIRETOR', 'PROFESSOR')
    public function temPerfil(UserRole|string ...$perfis): bool
    {
        $valores = array_map(
            fn (UserRole|string $p) => $p instanceof UserRole ? $p->value : $p,
            $perfis
        );

        return in_array($this->perfil->value, $valores, true);
    }
}

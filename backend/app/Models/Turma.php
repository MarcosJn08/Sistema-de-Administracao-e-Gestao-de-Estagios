<?php

namespace App\Models;

use App\Enums\StatusTurma;
use App\Enums\TurnoTurma;
use Illuminate\Database\Eloquent\Model;

class Turma extends Model
{
    protected $fillable = ['curso_id', 'nome', 'ano', 'semestre', 'turno', 'status'];

    protected $casts = [
        'turno'  => TurnoTurma::class,
        'status' => StatusTurma::class,
    ];

    public function curso()  { return $this->belongsTo(Curso::class); }
    public function alunos() { return $this->hasMany(Aluno::class); }
}
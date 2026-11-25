<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Turma extends Model
{
    protected $fillable = ['curso_id', 'nome', 'ano', 'semestre', 'turno', 'status'];

    public function curso()  { return $this->belongsTo(Curso::class); }
    public function alunos() { return $this->hasMany(Aluno::class); }
}
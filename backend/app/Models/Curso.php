<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Curso extends Model
{
    protected $fillable = ['nome', 'codigo', 'carga_horaria_estagio', 'status'];

    public function turmas() { return $this->hasMany(Turma::class); }

    // Alunos do curso, passando pelas turmas
    public function alunos()
    {
        return $this->hasManyThrough(Aluno::class, Turma::class);
    }
}

<?php

namespace App\Models;

use App\Enums\StatusCurso;
use Illuminate\Database\Eloquent\Model;

class Curso extends Model
{
    use HasFactory;

    use SoftDeletes;

    protected $fillable = [
        'nome',
        'codigo',
        'modalidade',
        'carga_horaria_estagio',
        'horas_minimas_estagio',
        'permite_aproveitamento_projetos',
        'modalidade_estagio',
        'status',
    ];

    protected $casts = [
        'status' => StatusCurso::class,
    ];

    public function turmas() { return $this->hasMany(Turma::class); }

    // Alunos do curso, passando pelas turmas
    public function alunos()
    {
        return $this->hasManyThrough(Aluno::class, Turma::class);
    }
}

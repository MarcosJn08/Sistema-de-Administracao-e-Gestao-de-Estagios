<?php

namespace App\Models;

use App\Enums\StatusCurso;
use Illuminate\Database\Eloquent\Model;

class Curso extends Model
{
    use HasFactory, SoftDeletes;

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
        'permite_aproveitamento_projetos' => 'boolean',
        'horas_minimas_estagio' => 'integer',
        'carga_horaria_estagio' => 'integer',
    ];

    protected static function boot(): void
    {
        parent::boot();

        static::saving(function (Curso $curso) {
            if ($curso->horas_minimas_estagio && !$curso->carga_horaria_estagio) {
                $curso->carga_horaria_estagio = $curso->horas_minimas_estagio;
            } elseif ($curso->carga_horaria_estagio && !$curso->horas_minimas_estagio) {
                $curso->horas_minimas_estagio = $curso->carga_horaria_estagio;
            }
        });
    }

    public function turmas()
    {
        return $this->hasMany(Turma::class);
    }

    public function alunos()
    {
        return $this->hasManyThrough(Aluno::class, Turma::class);
    }

    public function temEstagiosVinculados(): bool
    {
        $porTurma = Estagio::whereHas('aluno.turma', function ($q) {
            $q->where('curso_id', $this->id);
        })->exists();

        $porNome = Estagio::whereHas('aluno', function ($q) {
            $q->where('curso_nome', $this->nome);
        })->exists();

        return $porTurma || $porNome;
    }
}

<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Aluno extends Model
{
    protected $fillable = ['usuario_id', 'turma_id', 'matricula', 'cpf', 'carga_horaria_cumprida'];

    public function usuario()  { return $this->belongsTo(Usuario::class); }
    public function turma()    { return $this->belongsTo(Turma::class); }
    public function estagios() { return $this->hasMany(Estagio::class); }

    // Atalho para o curso, passando pela turma
    public function curso()
    {
        return $this->hasOneThrough(Curso::class, Turma::class, 'id', 'id', 'turma_id', 'curso_id');
    }

    public function cargaHorariaExigida(): int
    {
        return $this->turma->curso->carga_horaria_estagio;
    }

    public function cargaHorariaRestante(): int
    {
        return max(0, $this->cargaHorariaExigida() - $this->carga_horaria_cumprida);
    }
}

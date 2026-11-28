<?php

namespace App\Models;

use App\Enums\StatusEstagio;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Aluno extends Model
{
    use HasFactory;

    protected $fillable = [
        'usuario_id',
        'turma_id',
        'matricula',
        'cpf',
        'telefone',
        'curso_nome',
    ];

    public function usuario()
    {
        return $this->belongsTo(Usuario::class);
    }

    public function turma()
    {
        return $this->belongsTo(Turma::class);
    }

    public function estagios()
    {
        return $this->hasMany(Estagio::class);
    }

    // Atalho para o curso, passando pela turma
    public function curso()
    {
        return $this->hasOneThrough(Curso::class, Turma::class, 'id', 'id', 'turma_id', 'curso_id');
    }

    public function getCargaHorariaCumpridaAttribute(): float
    {
        $horasDiario = (float) DiarioFrequencia::whereHas('estagio', fn ($query) => $query->where('aluno_id', $this->id)->where('status', '!=', StatusEstagio::CANCELADO_DESVIO_FUNCAO))->where('assinado_supervisor', true)->sum('horas_diarias');
        $horasCampo = (float) FrequenciaDiariaCampo::whereHas('estagio', fn ($query) => $query->where('aluno_id', $this->id)->where('status', '!=', StatusEstagio::CANCELADO_DESVIO_FUNCAO))->where('presente', true)->sum('horas_cumpridas');
        $horasMensais = (float) FrequenciaMensal::whereHas('estagio', fn ($query) => $query->where('aluno_id', $this->id)->where('status', '!=', StatusEstagio::CANCELADO_DESVIO_FUNCAO))->where('status', 'APROVADO')->sum('total_horas_mes');

        return $horasDiario + $horasCampo + $horasMensais;
    }

    public function cargaHorariaExigida(): int
    {
        return $this->turma->curso->carga_horaria_estagio;
    }

    public function cargaHorariaRestante(): float
    {
        return max(0, $this->cargaHorariaExigida() - $this->carga_horaria_cumprida);
    }
}

<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class FrequenciaMensal extends Model
{
    use HasFactory;

    protected $table = 'frequencias_mensais';

    protected $fillable = [
        'estagio_id',
        'mes_competencia',
        'ano_competencia',
        'total_horas_mes',
        'arquivo_path',
        'status',
        'validado_por',
        'validado_em',
    ];

    protected $casts = [
        'mes_competencia' => 'integer',
        'ano_competencia' => 'integer',
        'total_horas_mes' => 'float',
        'validado_em' => 'datetime',
    ];

    public function estagio()
    {
        return $this->belongsTo(Estagio::class);
    }

    public function validadoPor()
    {
        return $this->belongsTo(ProfessorOrientador::class, 'validado_por');
    }
}

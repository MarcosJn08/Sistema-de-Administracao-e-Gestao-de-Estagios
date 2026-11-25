<?php

namespace App\Models;

use App\Enums\TipoAvaliacao;
use Illuminate\Database\Eloquent\Model;

class AvaliacaoEstagio extends Model
{
    protected $table = 'avaliacoes_estagio';
    protected $fillable = ['estagio_id', 'tipo', 'nota_desempenho',
                           'conceito_atitude', 'auto_avaliacao', 'parecer_final'];

    protected $casts = [
        'tipo' => TipoAvaliacao::class,
    ];

    public function estagio() { return $this->belongsTo(Estagio::class); }
}

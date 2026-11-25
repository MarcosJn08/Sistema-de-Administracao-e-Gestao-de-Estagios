<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PlanoEstagio extends Model
{
    protected $table = 'planos_estagio';
    protected $fillable = ['estagio_id', 'objetivos', 'atividades_previstas',
                           'cronograma', 'parecer_orientador'];
    public function estagio() { return $this->belongsTo(Estagio::class); }
}

<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class RelatorioEstagio extends Model
{
    protected $table = 'relatorios_estagio';
    protected $fillable = ['estagio_id', 'resumo_atividades', 'relacao_teoria_pratica',
                           'dificuldades', 'aprovado'];
    protected $casts = ['aprovado' => 'boolean'];
    public function estagio() { return $this->belongsTo(Estagio::class); }
}

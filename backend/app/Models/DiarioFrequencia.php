<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class DiarioFrequencia extends Model
{
    protected $table = 'diarios_frequencia';
    protected $fillable = ['estagio_id', 'data', 'hora_entrada', 'hora_saida',
                           'horas_diarias', 'assinado_supervisor'];
    protected $casts = ['data' => 'date', 'assinado_supervisor' => 'boolean'];
    public function estagio() { return $this->belongsTo(Estagio::class); }
}

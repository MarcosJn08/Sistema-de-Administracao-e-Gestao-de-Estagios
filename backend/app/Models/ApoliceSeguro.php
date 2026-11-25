<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ApoliceSeguro extends Model
{
    protected $table = 'apolices_seguro';
    protected $fillable = ['estagio_id', 'numero_apolice', 'nome_seguradora'];
    public function estagio() { return $this->belongsTo(Estagio::class); }
}


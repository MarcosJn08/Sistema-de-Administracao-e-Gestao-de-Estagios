<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class SupervisorEmpresa extends Model
{
    use HasFactory;

    protected $table = 'supervisores_empresa';

    protected $fillable = ['empresa_concedente_id', 'usuario_id', 'nome',
        'cargo', 'formacao', 'telefone', 'email'];

    public function empresa()
    {
        return $this->belongsTo(EmpresaConcedente::class, 'empresa_concedente_id');
    }

    public function estagios()
    {
        return $this->hasMany(Estagio::class);
    }
}

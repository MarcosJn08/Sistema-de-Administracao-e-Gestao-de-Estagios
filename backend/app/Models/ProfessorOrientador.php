<?php

namespace App\Models;

use App\Enums\StatusEstagio;
use Illuminate\Database\Eloquent\Model;

class ProfessorOrientador extends Model
{
    protected $table = 'professores_orientadores';
    protected $fillable = [
        'usuario_id',
        'siape_matricula',
        'departamento_area',
        'titulacao',
        'telefone',
        'area_atuacao',
        'regime_trabalho',
        'max_orientados',
    ];

    public function usuario()  { return $this->belongsTo(Usuario::class); }
    public function estagios() { return $this->hasMany(Estagio::class, 'professor_orientador_id'); }

    public function podeOrientarMais(): bool
    {
        return $this->estagios()
            ->where('status', StatusEstagio::EM_ANDAMENTO)
            ->count() < $this->max_orientados;
    }
}

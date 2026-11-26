<?php

namespace App\Models;

use App\Enums\StatusEstagio;
use App\Enums\UserRole;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class ProfessorOrientador extends Model
{
    use HasFactory;

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

    public function usuario()  { return $this->belongsTo(Usuario::class)->withTrashed(); }
    public function estagios() { return $this->hasMany(Estagio::class, 'professor_orientador_id'); }

    public function estagiosAtivos(): HasMany
    {
        return $this->estagios()->where('status', StatusEstagio::EM_ANDAMENTO);
    }

    public function contaAtiva(): bool
    {
        $usuario = $this->usuario;

        return $usuario?->status === 'ativo' && $usuario->is_active && ! $usuario->trashed()
            && $usuario->temPerfil(UserRole::PROFESSOR);
    }

    public function podeOrientarMais(): bool
    {
        return ($this->estagios_ativos_count ?? $this->estagiosAtivos()->count()) < $this->max_orientados;
    }
}

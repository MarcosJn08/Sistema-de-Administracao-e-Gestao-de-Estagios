<?php

namespace App\Models;

use App\Enums\StatusConvenio;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class EmpresaConcedente extends Model
{
    use HasFactory;

    protected $table = 'empresas_concedentes';

    protected $fillable = ['cnpj', 'razao_social', 'endereco_completo',
        'representante_legal', 'status_convenio'];

    protected $casts = [
        'status_convenio' => StatusConvenio::class,
    ];

    public function supervisores()
    {
        return $this->hasMany(SupervisorEmpresa::class);
    }

    public function estagios()
    {
        return $this->hasMany(Estagio::class);
    }

    public function convenioAtivo(): bool
    {
        return $this->status_convenio === StatusConvenio::ATIVO;
    }
}

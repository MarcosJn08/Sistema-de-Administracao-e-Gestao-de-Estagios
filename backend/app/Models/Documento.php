<?php

namespace App\Models;

use App\Enums\StatusDocumento;
use App\Enums\TipoDocumento;
use Illuminate\Database\Eloquent\Model;

class Documento extends Model
{
    protected $hidden = ['arquivo_path'];

    protected $table = 'documentos';

    protected $fillable = ['estagio_id', 'aluno_id', 'tipo', 'status', 'observacoes'];

    protected $casts = [
        'tipo' => TipoDocumento::class,
        'status' => StatusDocumento::class,
    ];

    public function estagio()
    {
        return $this->belongsTo(Estagio::class);
    }

    public function aluno()
    {
        return $this->belongsTo(Aluno::class);
    }
}

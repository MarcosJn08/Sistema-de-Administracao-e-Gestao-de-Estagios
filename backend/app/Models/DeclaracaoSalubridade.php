<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class DeclaracaoSalubridade extends Model
{
    protected $table = 'declaracoes_salubridade';
    protected $fillable = ['estagio_id', 'local_estagio', 'condicoes_higiene',
                           'possui_epi', 'riscos_ocupacionais'];
    protected $casts = ['possui_epi' => 'boolean'];
    public function estagio() { return $this->belongsTo(Estagio::class); }
}

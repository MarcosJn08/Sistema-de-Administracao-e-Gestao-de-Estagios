<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class FrequenciaDiariaCampo extends Model
{
    use HasFactory;

    protected $table = 'frequencias_diarias_campo';

    protected $fillable = [
        'estagio_id',
        'aluno_id',
        'professor_id',
        'data',
        'horas_cumpridas',
        'presente',
        'observacoes',
    ];

    protected $casts = [
        'data' => 'date',
        'horas_cumpridas' => 'decimal:2',
        'presente' => 'boolean',
    ];

    public function estagio()
    {
        return $this->belongsTo(Estagio::class);
    }

    public function aluno()
    {
        return $this->belongsTo(Aluno::class);
    }

    public function professor()
    {
        return $this->belongsTo(ProfessorOrientador::class, 'professor_id');
    }
}

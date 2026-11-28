<?php

namespace App\Models;

use App\Enums\ModalidadeEstagio;
use App\Enums\StatusEstagio;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Estagio extends Model
{
    use HasFactory;

    protected $fillable = ['aluno_id', 'empresa_concedente_id', 'professor_orientador_id',
        'supervisor_empresa_id', 'modalidade', 'data_inicio', 'data_termino',
        'carga_horaria_diaria', 'bolsa_auxilio', 'status', 'cargo', 'curso_id', 'carga_horaria_semanal', 'meta_horas_tce', 'encerrado_em', 'motivo_encerramento'];

    protected $casts = [
        'dados_documentais' => 'array',
        'carga_horaria_semanal' => 'decimal:2',
        'meta_horas_tce' => 'decimal:2',
        'encerrado_em' => 'datetime',
        'data_inicio' => 'date',
        'data_termino' => 'date',
        'bolsa_auxilio' => 'decimal:2',
        'status' => StatusEstagio::class,
        'modalidade' => ModalidadeEstagio::class,
    ];

    public function curso()
    {
        return $this->belongsTo(Curso::class);
    }

    public function aluno()
    {
        return $this->belongsTo(Aluno::class);
    }

    public function empresa()
    {
        return $this->belongsTo(EmpresaConcedente::class, 'empresa_concedente_id');
    }

    public function orientador()
    {
        return $this->belongsTo(ProfessorOrientador::class, 'professor_orientador_id');
    }

    public function supervisor()
    {
        return $this->belongsTo(SupervisorEmpresa::class, 'supervisor_empresa_id');
    }

    public function apolice()
    {
        return $this->hasOne(ApoliceSeguro::class);
    }

    public function plano()
    {
        return $this->hasOne(PlanoEstagio::class);
    }

    public function salubridade()
    {
        return $this->hasOne(DeclaracaoSalubridade::class);
    }

    public function relatorio()
    {
        return $this->hasOne(RelatorioEstagio::class);
    }

    public function frequencias()
    {
        return $this->hasMany(DiarioFrequencia::class);
    }

    public function frequenciasCampo()
    {
        return $this->hasMany(FrequenciaDiariaCampo::class);
    }

    public function frequenciasMensais()
    {
        return $this->hasMany(FrequenciaMensal::class);
    }

    public function avaliacoes()
    {
        return $this->hasMany(AvaliacaoEstagio::class);
    }

    public function documentos()
    {
        return $this->hasMany(Documento::class);
    }

    public function horasCumpridas(): float
    {
        $horasDiario = (float) $this->frequencias()->where('assinado_supervisor', true)->sum('horas_diarias');
        $horasCampo = (float) $this->frequenciasCampo()->where('presente', true)->sum('horas_cumpridas');
        $horasMensais = (float) $this->frequenciasMensais()->where('status', 'APROVADO')->sum('total_horas_mes');

        return $horasDiario + $horasCampo + $horasMensais;
    }

    public function estaFinalizado(): bool
    {
        return in_array($this->status, [
            StatusEstagio::CONCLUIDO,
            StatusEstagio::ENCERRADO,
            StatusEstagio::CANCELADO_DESVIO_FUNCAO,
        ], true);
    }
}

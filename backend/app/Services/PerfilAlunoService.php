<?php

namespace App\Services;

use App\Enums\TipoDocumento;
use App\Models\Aluno;

class PerfilAlunoService
{
    public const CAMPOS = [
        'dados-complementares' => ['naturalidade', 'uf_naturalidade', 'data_nascimento', 'filiacao', 'estado_civil', 'sexo', 'identidade', 'orgao_expedidor', 'telefone', 'serie_modulo_periodo', 'turno'],
        'endereco' => ['logradouro', 'numero', 'bairro', 'cidade', 'uf', 'cep'],
    ];

    public function checklist(Aluno $aluno): array
    {
        $dados = $aluno->dados_perfil ?? [];
        $etapas = [];
        foreach (self::CAMPOS as $id => $campos) {
            $pendentes = array_values(array_filter($campos, fn ($campo) => trim((string) ($dados[$campo] ?? ($campo === 'telefone' ? $aluno->telefone : ''))) === ''));
            $etapas[] = ['id' => $id, 'concluida' => count($pendentes) === 0, 'pendentes' => $pendentes];
        }
        $ficha = $aluno->hasMany(\App\Models\Documento::class)->where('tipo', TipoDocumento::FICHA_MATRICULA->value)->latest('id')->first();
        $etapas[] = ['id' => 'ficha-matricula', 'concluida' => $ficha && in_array($ficha->status->value, ['EM_ANALISE', 'DEFERIDO'], true), 'pendentes' => $ficha ? [] : ['ficha_matricula']];
        $concluidas = count(array_filter($etapas, fn ($etapa) => $etapa['concluida']));

        return ['etapas' => $etapas, 'percentual' => (int) round($concluidas / count($etapas) * 100), 'completo' => $concluidas === count($etapas)];
    }
}

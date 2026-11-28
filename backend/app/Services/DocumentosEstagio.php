<?php

namespace App\Services;

use App\Models\Estagio;
use App\Models\User;

class DocumentosEstagio
{
    public const NOMES = [
        'PLANO_ATIVIDADES' => 'Plano de Estágio',
        'TCE' => 'Termo de Compromisso de Estágio Obrigatório',
        'AVALIACAO_ALUNO' => 'Avaliação de Estágio pelo Estagiário',
        'AVALIACAO_EMPRESA' => 'Avaliação de Estágio pela Entidade Concedente',
    ];

    public function podeEditar(User $usuario, Estagio $estagio, string $tipo): bool
    {
        if ($tipo === 'AVALIACAO_EMPRESA') {
            return $usuario->temPerfil('EMPRESA');
        }

        if (! $usuario->temPerfil('ALUNO')) {
            return false;
        }

        if ($tipo === 'AVALIACAO_ALUNO') {
            $meta = $estagio->curso?->horas_minimas_estagio ?: $estagio->curso?->carga_horaria_estagio ?: $estagio->aluno->turma?->curso?->carga_horaria_estagio;

            return $estagio->status !== \App\Enums\StatusEstagio::CANCELADO_DESVIO_FUNCAO && $meta > 0 && $estagio->horasCumpridas() >= $meta;
        }

        return ! $estagio->estaFinalizado();
    }

    public function campos(Estagio $estagio, string $tipo): array
    {
        $aluno = $estagio->aluno;
        $perfil = $aluno->dados_perfil ?? [];
        $empresa = $estagio->empresa;
        $supervisor = $estagio->supervisor;
        $dados = [
            'Estagiário' => $aluno->usuario?->nome,
            'Curso' => $estagio->curso?->nome ?? $aluno->turma?->curso?->nome ?? $aluno->curso_nome,
        ];
        $estagioDados = [
            'Empresa concedente' => $empresa->razao_social,
            'Início' => $estagio->data_inicio?->format('d/m/Y'),
            'Término' => $estagio->data_termino?->format('d/m/Y'),
            'Supervisor' => $supervisor?->nome,
            'Orientador' => $estagio->orientador?->usuario?->nome,
            'Atividades principais' => $estagio->plano?->atividades_previstas,
        ];
        $contrato = $estagioDados + [
            'Número da apólice' => $estagio->apolice?->numero_apolice,
            'Seguradora' => $estagio->apolice?->nome_seguradora,
            'Endereço da concedente' => $empresa->endereco_completo,
            'Cidade da concedente' => $empresa->cidade, 'UF da concedente' => $empresa->uf, 'CEP da concedente' => $empresa->cep,
            'Telefone da concedente' => $empresa->telefone,
            'Jornada de estágio' => $estagio->carga_horaria_diaria ? $estagio->carga_horaria_diaria.' h/dia' : null,
            'Horários de trabalho' => null, 'Horas semanais' => $estagio->carga_horaria_semanal,
        ];
        $academico = [
            'Situação acadêmica' => !empty($perfil['integralizou']) ? 'ICHC' : ($perfil['serie_modulo_periodo'] ?? null),
            'Semestre e ano de integralização (se aplicável)' => $perfil['semestre_integralizacao'] ?? null,
        ];
        $dados += match ($tipo) {
            'PLANO_ATIVIDADES' => $contrato + [
                'Fax (se aplicável)' => $empresa->fax, 'Responsável pela concedente' => $empresa->representante_legal,
                'Cargo do responsável' => $empresa->cargo_representante, 'E-mail de contato' => $empresa->email,
                'Setor ou unidade' => null, 'Habilitação do supervisor' => $supervisor?->formacao,
            ],
            'TCE' => $contrato + [
                'Instituição de ensino' => 'Instituto Federal do Norte de Minas Gerais — Campus Almenara',
                'Endereço da instituição' => 'Rodovia BR 367, km 111, Zona Rural',
                'Município e UF da instituição' => 'Almenara — MG',
                'CEP da instituição' => '39900-000',
                'Telefone da instituição' => '(38) 3201-3090',

                'RG' => $perfil['identidade'] ?? null, 'CPF' => $aluno->cpf,
                'Nascimento' => $perfil['data_nascimento'] ?? null,
                'Endereço residencial' => $perfil['logradouro'] ?? null,
                'Número residencial' => $perfil['numero'] ?? null, 'Complemento (se aplicável)' => $perfil['complemento'] ?? null,
                'Bairro' => $perfil['bairro'] ?? null, 'Cidade' => $perfil['cidade'] ?? null,
                'UF' => $perfil['uf'] ?? null, 'CEP' => $perfil['cep'] ?? null, 'Telefone' => $aluno->telefone,
                'Turma' => $aluno->turma?->nome, 'CNPJ da concedente' => $empresa->cnpj,
                'Número da concedente' => $empresa->numero, 'Bairro da concedente' => $empresa->bairro,
                'Registro da concedente' => $empresa->numero_registro, 'Conselho de fiscalização' => $empresa->conselho_fiscalizacao,
                'Remuneração' => $estagio->bolsa_auxilio === null ? null : ((float) $estagio->bolsa_auxilio > 0 ? 'Sim' : 'Não'),
                'Valor da remuneração' => $estagio->bolsa_auxilio, 'Valor por extenso (se aplicável)' => null,
                'Auxílio-transporte' => null, 'Valor do auxílio (se aplicável)' => null,
                'Cargo do supervisor' => $supervisor?->cargo, 'Data de assinatura' => null,
                'Responsável legal do aluno (se aplicável)' => null, 'RG e órgão emissor do responsável (se aplicável)' => null,
            ],
            'AVALIACAO_ALUNO' => $academico + array_fill_keys([
                'Supervisão da concedente', 'Orientação do IFNMG', 'Aspectos positivos', 'Aspectos negativos',
                'Participou de cursos?', 'Cursos realizados (se aplicável)', 'Disciplinas que contribuíram',
                'Os conhecimentos adquiridos foram suficientes?', 'Conteúdos a acrescentar', ...self::PERCENTUAIS,
            ], null),
            'AVALIACAO_EMPRESA' => $academico + $estagioDados + [
                'Cidade da concedente' => $empresa->cidade, 'UF da concedente' => $empresa->uf,
                'Carga horária cumprida' => $estagio->horasCumpridas(),
            ] + array_fill_keys([
                'Iniciativa', 'Interesse pela empresa',
                'Interesse técnico', 'Organização', 'Pontualidade', 'Zelo pelo ambiente', 'Relacionamento com funcionários',
                'Relacionamento com supervisor', 'Conhecimentos gerais', 'Conhecimentos técnicos',
                'Assimilação de novos conhecimentos', 'Observações do supervisor',
            ], null),
        };

        return $dados;
    }

    public const CAMPOS_CONCEDENTE = [
        'Cidade da concedente',
        'UF da concedente',
        'CEP da concedente',
        'Telefone da concedente',
        'Fax (se aplicável)',
        'Cargo do responsável',
        'E-mail de contato',
        'Número da concedente',
        'Bairro da concedente',
        'Registro da concedente',
        'Conselho de fiscalização',
        'Empresa concedente',
        'Responsável pela concedente',
        'Endereço da concedente',
        'CNPJ da concedente',
    ];

    public const PERCENTUAIS = [
        'Dedicação pessoal (%)', 'Aprendizagem (%)', 'Relacionamento com funcionários (%)',
        'Relacionamento com supervisor (%)', 'Relacionamento com orientador (%)',
        'Atendimento da concedente (%)', 'Avaliação do curso (%)',
    ];

    public function opcoes(string $campo): array
    {
        return match ($campo) {
            'Iniciativa', 'Interesse pela empresa', 'Interesse técnico', 'Organização', 'Pontualidade', 'Zelo pelo ambiente',
            'Relacionamento com funcionários', 'Relacionamento com supervisor', 'Conhecimentos gerais',
            'Conhecimentos técnicos', 'Assimilação de novos conhecimentos' => ['Atendeu às expectativas', 'Não atendeu às expectativas'],
            'Supervisão da concedente', 'Orientação do IFNMG' => ['Ótima', 'Boa', 'Regular', 'Péssima'],
            'Participou de cursos?', 'Os conhecimentos adquiridos foram suficientes?', 'Remuneração', 'Auxílio-transporte' => ['Sim', 'Não'],
            default => [],
        };
    }
}

<!doctype html>
<html lang="pt-BR">
<head>
    <meta charset="utf-8">
    <style>
        @page { margin: 14mm 18mm 19mm; }
        body { font-family: 'DejaVu Sans', sans-serif; font-size: 9pt; color: #171717; }
        header { text-align: center; border-bottom: 2px solid #257347; padding-bottom: 8px; }
        header strong { display: block; color: #176139; font-size: 13pt; }
        h1 { font-size: 12pt; text-align: center; margin: 14px 0; }
        h2 { background: #e9f2eb; color: #176139; padding: 5px 7px; font-size: 9pt; margin: 11px 0 5px; page-break-after: avoid; }
        h3 { font-size: 9pt; page-break-after: avoid; }
        p { margin: 5px 0; }
        .linha { border-bottom: 1px solid #777; padding: 4px 0; overflow-wrap: break-word; }
        .plano .linha { padding: 2px 0; }
        .plano .linha-curta { display: inline-block; width: 48%; margin-right: 1%; vertical-align: top; }
        .plano .assinatura { margin-top: 18px; }
        .resposta { white-space: pre-wrap; overflow-wrap: break-word; }
        .em-branco { height: 15px; border-bottom: 1px solid #aaa; }
        .assinaturas { text-align: center; page-break-inside: avoid; }
        .assinatura { display: inline-block; width: 44%; margin: 26px 2% 4px; border-top: 1px solid; padding-top: 4px; vertical-align: top; }
        .nota { font-size: 7pt; }
        footer { position: fixed; bottom: -11mm; left: 0; right: 0; border-top: 1px solid #bbb; text-align: center; font-size: 7pt; padding-top: 5px; }
    </style>
</head>
<body class="{{ $tipo === 'PLANO_ATIVIDADES' ? 'plano' : '' }}">
@php
    $valores = array_column($campos, 'valor', 'rotulo');
    $valor = fn ($campo) => $valores[$campo] ?? '______________________';
    $opcao = fn ($campo, $opcao) => ($valores[$campo] ?? null) === $opcao ? '(X)' : '( )';
@endphp
<header><strong>INSTITUTO FEDERAL DO NORTE DE MINAS GERAIS</strong>Campus Almenara</header>
<h1>{{ mb_strtoupper($nome) }}</h1>
<footer>
    Rodovia BR 367 Almenara/Jequitinhonha, km 111, Zona Rural, Almenara-MG - CEP: 39900-000<br>
    Fone: (038) 3201-3090 - E-mail: comunicacao.almenara@ifnmg.edu.br
</footer>

@if ($tipo === 'PLANO_ATIVIDADES')
    <p>( X ) Obrigatório &nbsp;&nbsp; ( &nbsp; ) Não obrigatório</p>
    @include('pdf.estagio.campos', ['secoes' => [
        'Dados do seguro contra acidentes pessoais' => ['Número da apólice', 'Seguradora'],
        'Dados da entidade concedente de estágio' => ['Empresa concedente', 'Endereço da concedente', 'Telefone da concedente', 'Fax (se aplicável)', 'Cidade da concedente', 'UF da concedente', 'CEP da concedente', 'Responsável pela concedente', 'Cargo do responsável', 'E-mail de contato'],
        'Dados do estágio' => ['Estagiário', 'Curso', 'Setor ou unidade', 'Supervisor', 'Habilitação do supervisor', 'Orientador', 'Início', 'Término', 'Jornada de estágio', 'Horários de trabalho', 'Horas semanais'],
    ]])
    <h2>Atividades principais a serem desenvolvidas</h2>
    @include('pdf.estagio.resposta', ['campo' => 'Atividades principais', 'linhas' => 4])
    @include('pdf.estagio.assinaturas', ['assinaturas' => ['Estagiário', 'Professor(a) orientador(a) – IFNMG', 'Supervisor do estágio', 'Coordenador do curso']])
@elseif ($tipo === 'AVALIACAO_ALUNO' || $tipo === 'AVALIACAO_EMPRESA')
    @include('pdf.estagio.campos', ['secoes' => ['Informações básicas' => ['Estagiário', 'Curso']]])
    <p>{{ isset($valores['Situação acadêmica']) && $valores['Situação acadêmica'] !== 'ICHC' ? '(X)' : '( )' }} Cursando — série, módulo ou período: {{ ($valores['Situação acadêmica'] ?? null) === 'ICHC' ? '__________' : $valor('Situação acadêmica') }}</p>
    <p>{{ $opcao('Situação acadêmica', 'ICHC') }} Integralizou a carga horária do curso (ICHC)*</p>
    <p>Semestre/ano de integralização: {{ $valor('Semestre e ano de integralização (se aplicável)') }}</p>
    @if ($tipo === 'AVALIACAO_ALUNO')
        @include('pdf.estagio.avaliacao-aluno')
    @else
        @include('pdf.estagio.avaliacao-empresa')
    @endif
    <p class="nota">* Concluiu com aproveitamento todas as disciplinas/módulos que integram a estrutura curricular do curso, excluindo-se estágios e defesas de TCC, entre outras atividades que não pressuponham a presença regular do aluno nas dependências da instituição.</p>
@else
    <p>Minuta de trabalho do SAGE. A assinatura exige o modelo institucional com as cláusulas oficiais.</p>
    @include('pdf.estagio.campos', ['secoes' => [
        'Dados do estagiário' => ['Estagiário', 'Curso', 'Turma', 'RG', 'CPF', 'Nascimento', 'Endereço residencial', 'Número residencial', 'Complemento (se aplicável)', 'Bairro', 'Cidade', 'UF', 'CEP', 'Telefone', 'Responsável legal do aluno (se aplicável)', 'RG e órgão emissor do responsável (se aplicável)'],
        'Dados da entidade concedente' => ['Empresa concedente', 'CNPJ da concedente', 'Endereço da concedente', 'Número da concedente', 'Bairro da concedente', 'Cidade da concedente', 'UF da concedente', 'CEP da concedente', 'Telefone da concedente', 'Registro da concedente', 'Conselho de fiscalização'],
        'Instituição de ensino' => ['Instituição de ensino', 'Endereço da instituição', 'Município e UF da instituição', 'CEP da instituição', 'Telefone da instituição'],
        'Dados do estágio' => ['Início', 'Término', 'Jornada de estágio', 'Horários de trabalho', 'Horas semanais', 'Supervisor', 'Cargo do supervisor', 'Orientador', 'Número da apólice', 'Seguradora', 'Atividades principais', 'Remuneração', 'Valor da remuneração', 'Valor por extenso (se aplicável)', 'Auxílio-transporte', 'Valor do auxílio (se aplicável)', 'Data de assinatura'],
    ]])
    @include('pdf.estagio.assinaturas', ['assinaturas' => ['Entidade concedente', 'IFNMG', 'Estagiário', 'Responsável legal, se aplicável']])
@endif
</body>
</html>

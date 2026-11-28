<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><style>
@page{margin:14mm 18mm 16mm}body{font-family:'DejaVu Sans',sans-serif;font-size:9pt;color:#171717}header{text-align:center;border-bottom:2px solid #257347;padding-bottom:8px;margin-bottom:10px}header strong{display:block;color:#176139;font-size:13pt}h1{text-align:center;font-size:12pt;margin:9px 0 12px}.row{margin:5px 0;border-bottom:1px solid #555;min-height:15px}.label{font-weight:bold}.section{background:#e9f2eb;padding:5px 7px;margin-top:10px;font-weight:bold;color:#176139}.two{width:100%;border-collapse:collapse}.two td{width:50%;vertical-align:top;padding:4px 5px 3px 0;border-bottom:1px solid #555}.empty{height:16px;border-bottom:1px solid #555}.check{margin:5px 0}.signature{text-align:center;margin-top:20px}.signature span{display:inline-block;border-top:1px solid #333;width:65%;padding-top:5px}.note{font-size:7pt;margin-top:9px}.footer{position:fixed;bottom:-10mm;left:0;right:0;text-align:center;font-size:7pt;border-top:1px solid #bbb;padding-top:5px}
</style></head><body>
<header><strong>INSTITUTO FEDERAL DO NORTE DE MINAS GERAIS</strong>Campus Almenara - Secretaria do Curso</header>
<h1>FICHA DE MATRÍCULA DE ESTÁGIO</h1>
@php($v = fn($key, $fallback = '') => e($dados[$key] ?? $fallback ?: '________________________________'))
<div class="row"><span class="label">Estagiário(a):</span> {{ $aluno->usuario->nome ?? $aluno->usuario->name }}</div>
<table class="two"><tr><td><b>Natural de:</b> {!! $v('naturalidade') !!}</td><td><b>UF:</b> {!! $v('uf_naturalidade') !!}</td></tr>
<tr><td><b>Data de nascimento:</b> {{ !empty($dados['data_nascimento']) ? \Carbon\Carbon::parse($dados['data_nascimento'])->format('d/m/Y') : '____/____/________' }}</td><td><b>Filiação:</b> {!! $v('filiacao') !!}</td></tr>
<tr><td><b>Estado civil:</b> {!! $v('estado_civil') !!}</td><td><b>Sexo:</b> {!! $v('sexo') !!}</td></tr>
<tr><td><b>Identidade nº:</b> {!! $v('identidade') !!}</td><td><b>Órgão expedidor:</b> {!! $v('orgao_expedidor') !!}</td></tr></table>
<div class="row"><b>CPF:</b> {{ $aluno->cpf ?: $aluno->usuario->cpf }}</div>
<div class="section">Endereço e contato</div>
<table class="two"><tr><td><b>Rua / Avenida:</b> {!! $v('logradouro') !!}</td><td><b>Nº:</b> {!! $v('numero') !!}</td></tr>
<tr><td><b>Bairro:</b> {!! $v('bairro') !!}</td><td><b>Complemento:</b> {!! $v('complemento') !!}</td></tr>
<tr><td><b>Cidade:</b> {!! $v('cidade') !!}</td><td><b>UF / CEP:</b> {!! $v('uf') !!} / {!! $v('cep') !!}</td></tr>
<tr><td><b>Telefone fixo:</b> {!! $v('telefone_fixo') !!}</td><td><b>Celular:</b> {!! $v('telefone', $aluno->telefone) !!}</td></tr></table>
<div class="row"><b>E-mail:</b> {{ $aluno->usuario->email }}</div>
<div class="section">Dados acadêmicos</div>
<div class="row"><b>Matrícula no IFNMG - Campus Almenara nº:</b> {{ $aluno->matricula }}</div>
<table class="two"><tr><td><b>Curso:</b> {{ $aluno->turma?->curso?->nome ?? $aluno->curso_nome ?: '____________________' }}</td><td><b>Turma:</b> {{ $aluno->turma?->nome ?: '____________________' }}</td></tr></table>
<div class="check">( {{ empty($dados['integralizou']) ? 'X' : ' ' }} ) Cursando {!! $v('serie_modulo_periodo') !!} {{ ($dados['tipo_curso'] ?? '') === 'Técnico' ? 'ano do curso técnico' : (($dados['tipo_curso'] ?? '') === 'Superior' ? 'semestre do curso superior' : 'série / módulo / período') }}</div>
<div class="check">Turno: ( {{ ($dados['turno'] ?? '') === 'Matutino' ? 'X' : ' ' }} ) Matutino &nbsp; ( {{ ($dados['turno'] ?? '') === 'Vespertino' ? 'X' : ' ' }} ) Vespertino &nbsp; ( {{ ($dados['turno'] ?? '') === 'Noturno' ? 'X' : ' ' }} ) Noturno</div>
<div class="check">( {{ !empty($dados['integralizou']) ? 'X' : ' ' }} ) Integralizou a Carga Horária do Curso (ICHC)* &nbsp; Semestre/Ano: {!! $v('semestre_integralizacao') !!}</div>
<div class="section">Campo reservado à Secretaria do Curso</div>
<p><b>Parecer da Secretaria do Curso:</b></p>
<div class="check">( &nbsp; ) Aluno(a) regularmente matriculado no curso</div>
<div class="check">( &nbsp; ) Aluno(a) que integralizou a carga horária do curso</div>
<div class="check">( &nbsp; ) Aluno(a) em regime de dependência(s)</div>
<div>Dependência(s) em:</div><div class="empty"></div><div class="empty"></div><div class="empty"></div>
<p>________________________ (MG), ____/____/________</p>
<div class="signature"><span>Coord. Reg. Escolar / Coord. Reg. Acadêmico</span></div>
<p class="note">* Concluiu com aproveitamento todas as disciplinas/módulos que integram a estrutura curricular do curso, excluindo-se estágios e defesas de TCC, entre outras atividades que não pressuponham presença regular na instituição.</p>
<div class="footer">Rodovia BR 367 Almenara/Jequitinhonha, km 111, Zona Rural, Almenara-MG - CEP: 39900-000<br>Fone: (038) 3201-3090 - E-mail: comunicacao.almenara@ifnmg.edu.br</div>
</body></html>

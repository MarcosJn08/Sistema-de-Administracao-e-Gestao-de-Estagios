@include('pdf.estagio.campos', ['secoes' => ['Dados do estágio' => ['Empresa concedente', 'Cidade da concedente', 'UF da concedente', 'Início', 'Término', 'Carga horária cumprida', 'Supervisor']]])
<h2>Atividades principais desenvolvidas pelo estagiário</h2>
@include('pdf.estagio.resposta', ['campo' => 'Atividades principais', 'linhas' => 5])
<h2>Avaliação do estagiário</h2>
@foreach ([
    'Envolvimento e responsabilidade' => ['Iniciativa', 'Interesse pela empresa', 'Interesse técnico', 'Organização', 'Pontualidade', 'Zelo pelo ambiente'],
    'Relacionamento interpessoal' => ['Relacionamento com funcionários', 'Relacionamento com supervisor'],
    'Formação profissional' => ['Conhecimentos gerais', 'Conhecimentos técnicos', 'Assimilação de novos conhecimentos'],
] as $grupo => $criterios)
    <h3>{{ $grupo }}</h3>
    @foreach ($criterios as $campo)
        <div class="linha">
            <strong>{{ $campo }}</strong><br>
            {{ $opcao($campo, 'Atendeu às expectativas') }} Atendeu às expectativas &nbsp;
            {{ $opcao($campo, 'Não atendeu às expectativas') }} Não atendeu às expectativas
            @if (isset($valores[$campo]) && !in_array($valores[$campo], ['Atendeu às expectativas', 'Não atendeu às expectativas'], true))
                <br>{{ $valores[$campo] }}
            @endif
        </div>
    @endforeach
@endforeach
<h2>Comentários</h2>
@include('pdf.estagio.resposta', ['campo' => 'Observações do supervisor', 'linhas' => 6])
@include('pdf.estagio.assinaturas', ['assinaturas' => ['Supervisor da entidade concedente (com carimbo)', 'Estagiário']])
<h2>Campo reservado ao IFNMG – Campus Almenara</h2>
<p><strong>Parecer do professor orientador</strong></p>
<div class="em-branco"></div>
<div class="em-branco"></div>
<p>( &nbsp; ) Aprovado &nbsp; ( &nbsp; ) Reprovado &nbsp; Data: ____/____/________</p>
<div class="assinatura">Professor orientador</div>

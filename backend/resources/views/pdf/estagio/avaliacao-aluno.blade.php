<h2>Avaliação do estágio</h2>
@foreach (['Supervisão da concedente' => '1. Como foi a supervisão da entidade concedente durante o estágio?', 'Orientação do IFNMG' => '2. Como foi a orientação do IFNMG – Campus Almenara durante o estágio?'] as $campo => $pergunta)
    <h3>{{ $pergunta }}</h3>
    <p>@foreach (['Ótima', 'Boa', 'Regular', 'Péssima'] as $alternativa) {{ $opcao($campo, $alternativa) }} {{ $alternativa }} &nbsp; @endforeach</p>
@endforeach
<h3>3. Relate fatos ou atividades desenvolvidas durante o estágio.</h3>
@foreach (['Aspectos positivos', 'Aspectos negativos'] as $campo)
    <p><strong>{{ $campo }}</strong></p>
    @include('pdf.estagio.resposta', ['campo' => $campo, 'linhas' => 3])
@endforeach
<h3>4. Participou de cursos na entidade concedente? Quais?</h3>
<p>{{ $opcao('Participou de cursos?', 'Sim') }} Sim &nbsp; {{ $opcao('Participou de cursos?', 'Não') }} Não</p>
@include('pdf.estagio.resposta', ['campo' => 'Cursos realizados (se aplicável)', 'linhas' => 3])
<h3>5. Quais disciplinas mais contribuíram para suas atividades?</h3>
@include('pdf.estagio.resposta', ['campo' => 'Disciplinas que contribuíram', 'linhas' => 3])
<h3>6. Os conhecimentos adquiridos no curso foram suficientes para o estágio?</h3>
<p>{{ $opcao('Os conhecimentos adquiridos foram suficientes?', 'Sim') }} Sim &nbsp; {{ $opcao('Os conhecimentos adquiridos foram suficientes?', 'Não') }} Não</p>
<h3>7. Que conteúdos você acrescentaria ao curso?</h3>
@include('pdf.estagio.resposta', ['campo' => 'Conteúdos a acrescentar', 'linhas' => 3])
<h3>8. Avalie de 0 a 100% os aspectos abaixo.</h3>
@foreach (\App\Services\DocumentosEstagio::PERCENTUAIS as $campo)
    <div class="linha">{{ str_replace(' (%)', '', $campo) }}: {{ $valores[$campo] ?? '____' }}%</div>
@endforeach
@include('pdf.estagio.assinaturas', ['assinaturas' => ['Estagiário']])

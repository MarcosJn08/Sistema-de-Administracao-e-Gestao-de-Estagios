@if (isset($valores[$campo]))
    <div class="linha resposta">{{ $valores[$campo] }}</div>
@else
    @for ($i = 0; $i < $linhas; $i++)
        <div class="em-branco"></div>
    @endfor
@endif

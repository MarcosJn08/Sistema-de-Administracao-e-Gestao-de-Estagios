@foreach ($secoes as $secao => $rotulos)
    <h2>{{ $secao }}</h2>
    @foreach ($rotulos as $rotulo)
        <div class="linha {{ in_array($rotulo, ['Número da apólice', 'Seguradora', 'Telefone da concedente', 'Fax (se aplicável)', 'UF da concedente', 'CEP da concedente', 'Início', 'Término'], true) ? 'linha-curta' : '' }}"><strong>{{ $rotulo }}:</strong> <span class="resposta">{{ $valor($rotulo) }}</span></div>
    @endforeach
@endforeach

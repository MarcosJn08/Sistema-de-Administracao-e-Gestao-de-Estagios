<?php

namespace App\Http\Controllers;

use App\Enums\StatusDocumento;
use App\Enums\TipoDocumento;
use App\Models\Documento;
use App\Models\Estagio;
use App\Services\DocumentosEstagio;
use Dompdf\Dompdf;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;
use Symfony\Component\HttpFoundation\StreamedResponse;

class DocumentoController extends Controller
{
    public function __construct(private readonly DocumentosEstagio $modelos) {}

    public function catalogo(Request $request, Estagio $estagio): JsonResponse
    {
        Gate::authorize('view', $estagio);
        $versoes = $estagio->documentos()->latest('id')->get()->groupBy('tipo.value');
        $catalogo = [];
        foreach (DocumentosEstagio::NOMES as $tipo => $nome) {
            if ($tipo === 'TCE' && $request->user()->temPerfil('EMPRESA')) {
                continue;
            }
            $documento = $versoes->get($tipo)?->first();
            $catalogo[] = [
                'tipo' => $tipo, 'nome' => $nome, 'documento' => $documento,
                'editavel' => $this->modelos->podeEditar($request->user(), $estagio, $tipo)
                    && !in_array($documento?->status, [StatusDocumento::EM_ANALISE, StatusDocumento::DEFERIDO], true),
            ];
        }

        return $this->successResponse($catalogo);
    }

    public function modelo(Request $request, Estagio $estagio, string $tipo): mixed
    {
        Gate::authorize('view', $estagio);
        abort_unless(isset(DocumentosEstagio::NOMES[$tipo]), 404);
        abort_if($tipo === 'TCE' && $request->user()->temPerfil('EMPRESA'), 403);
        if ($request->isMethod('patch')) {
            return DB::transaction(function () use ($request, $estagio, $tipo) {
                $estagio = Estagio::whereKey($estagio->id)->lockForUpdate()->firstOrFail();
                $this->autorizarEdicao($request, $estagio, $tipo);
                $catalogo = $this->modelos->campos($estagio, $tipo);
                $dados = $request->validate(['campos' => 'required|array'])['campos'];
                $extras = $estagio->dados_documentais ?? [];
                $grupo = str_starts_with($tipo, 'AVALIACAO_') ? $tipo : 'compartilhado';
                foreach ($dados as $campo => $valor) {
                    $opcoes = $this->modelos->opcoes($campo);
                    $valido = is_string($valor) && trim($valor) !== '' && mb_strlen($valor) <= 2000;
                    if (in_array($campo, DocumentosEstagio::PERCENTUAIS, true)) {
                        $valido = $valido && ctype_digit($valor) && (int) $valor <= 100;
                    }
                    abort_unless(!in_array($campo, DocumentosEstagio::CAMPOS_CONCEDENTE, true) && array_key_exists($campo, $catalogo) && $catalogo[$campo] === null && $valido
                        && (!$opcoes || in_array($valor, $opcoes, true)), 422, 'Campo inválido ou já preenchido pelo cadastro.');
                    $extras[$grupo][$campo] = trim($valor);
                }
                $estagio->forceFill(['dados_documentais' => $extras])->save();

                return $this->successResponse(null, 'Campos salvos.');
            });
        }

        $campos = [];
        foreach ($this->modelos->campos($estagio, $tipo) as $rotulo => $origem) {
            $grupo = str_starts_with($tipo, 'AVALIACAO_') ? $tipo : 'compartilhado';
            $concedente = in_array($rotulo, DocumentosEstagio::CAMPOS_CONCEDENTE, true);
            $campos[] = ['rotulo' => $rotulo, 'valor' => $origem ?? ($concedente ? null : ($estagio->dados_documentais[$grupo][$rotulo] ?? null)),
                'editavel' => !$concedente && $origem === null, 'opcoes' => $this->modelos->opcoes($rotulo),
                'percentual' => in_array($rotulo, DocumentosEstagio::PERCENTUAIS, true)];
        }
        if (!$request->boolean('pdf')) {
            return $this->successResponse($campos);
        }

        $pdf = new Dompdf(['defaultFont' => 'DejaVu Sans']);
        $pdf->loadHtml(view('pdf.documento-estagio', ['nome' => DocumentosEstagio::NOMES[$tipo], 'campos' => $campos, 'tipo' => $tipo])->render());
        $pdf->setPaper('a4');
        $pdf->render();

        return response($pdf->output(), 200, ['Content-Type' => 'application/pdf', 'Cache-Control' => 'private, no-store']);
    }

    private function autorizarEdicao(Request $request, Estagio $estagio, string $tipo): void
    {
        Gate::authorize('view', $estagio);
        abort_unless($this->modelos->podeEditar($request->user(), $estagio, $tipo), 403, 'Este documento ainda não pode ser editado por você.');
        abort_if($estagio->documentos()->where('tipo', $tipo)->whereIn('status', ['EM_ANALISE', 'DEFERIDO'])->exists(), 422, 'Já existe uma versão em análise ou aprovada.');
    }

    public function anexar(Request $request, Estagio $estagio): JsonResponse
    {
        return $this->gravarArquivo($request, $estagio, true);
    }

    public function encaminhar(Request $request, Estagio $estagio, Documento $documento): JsonResponse
    {
        return DB::transaction(function () use ($request, $estagio, $documento) {
            $estagio = Estagio::whereKey($estagio->id)->lockForUpdate()->firstOrFail();
            $documento = $estagio->documentos()->findOrFail($documento->id);
            $this->autorizarEdicao($request, $estagio, $documento->tipo->value);
            abort_unless($documento->status === StatusDocumento::PENDENTE && $documento->enviado_por === $request->user()->id
                && $estagio->documentos()->where('tipo', $documento->tipo->value)->latest('id')->value('id') === $documento->id, 422);
            $documento->update(['status' => StatusDocumento::EM_ANALISE]);
            $this->historico($documento, $request->user()->id);

            return $this->successResponse($documento, 'Documento encaminhado ao diretor.');
        });
    }

    public function recebidos(Request $request): JsonResponse
    {
        abort_unless($request->user()->temPerfil('DIRETOR'), 403);
        $filtros = $request->validate(['aluno_id' => 'sometimes|integer|min:1']);
        $documentos = Documento::query()
            ->where(fn ($query) => $query->whereNotNull('estagio_id')->orWhereNotNull('aluno_id'))
            ->when(isset($filtros['aluno_id']), fn ($query) => $query->where(function ($query) use ($filtros) {
                $query->whereHas('estagio', fn ($estagio) => $estagio->where('aluno_id', $filtros['aluno_id']))
                    ->orWhere(fn ($ficha) => $ficha->whereNull('estagio_id')->where('aluno_id', $filtros['aluno_id']));
            }))
            ->with('aluno.usuario', 'estagio.aluno.usuario', 'estagio.empresa')->latest('id')->get()
            ->map(function (Documento $doc) {
                $aluno = $doc->estagio?->aluno ?? $doc->aluno;

                return [
                    'id' => $doc->id, 'estagio_id' => $doc->estagio_id, 'aluno_id' => $aluno?->id,
                    'tipo' => $doc->tipo->value, 'status' => $doc->status, 'created_at' => $doc->created_at,
                    'nome' => DocumentosEstagio::NOMES[$doc->tipo->value] ?? match ($doc->tipo) {
                        TipoDocumento::FICHA_MATRICULA => 'Ficha de matrícula de estágio',
                        TipoDocumento::RELATORIO_PARCIAL => 'Relatório parcial',
                        TipoDocumento::RELATORIO_FINAL => 'Relatório final',
                        TipoDocumento::FOLHA_FREQUENCIA => 'Folha de frequência',
                        default => $doc->tipo->value,
                    },
                    'aluno' => $aluno?->usuario?->nome, 'matricula' => $aluno?->matricula,
                    'empresa' => $doc->estagio?->empresa?->razao_social,
                    'observacoes' => $doc->observacoes, 'tem_arquivo' => (bool) $doc->arquivo_path,
                    'pode_analisar' => $doc->status === StatusDocumento::EM_ANALISE && (bool) $doc->arquivo_path
                        && (!$doc->estagio?->estaFinalizado() || str_starts_with($doc->tipo->value, 'AVALIACAO_')),
                ];
            });

        return $this->successResponse($documentos);
    }

    public function index(Request $request, Estagio $estagio): JsonResponse
    {
        Gate::authorize('view', $estagio);
        $data = $request->validate(['per_page' => 'sometimes|integer|min:1|max:100']);

        return $this->successResponse($estagio->documentos()->latest('id')->paginate($data['per_page'] ?? 20));
    }

    public function store(Request $request, Estagio $estagio): JsonResponse
    {
        return $this->gravarArquivo($request, $estagio, false);
    }

    private function gravarArquivo(Request $request, Estagio $estagio, bool $rascunho): JsonResponse
    {
        Gate::authorize($rascunho ? 'view' : 'submit', $estagio);
        $data = $request->validate(['tipo' => ['required', Rule::enum(TipoDocumento::class)], 'arquivo' => 'required|file|mimes:pdf|max:10240']);
        if (!$rascunho && str_starts_with($data['tipo'], 'AVALIACAO_')) {
            abort(422, 'Use a área de documentos do estágio para enviar a avaliação.');
        }
        $file = $request->file('arquivo');
        $path = $file->store('documentos', 'local');
        abort_unless($path, 500, 'Não foi possível armazenar o documento.');
        try {
            $documento = DB::transaction(function () use ($estagio, $data, $request, $file, $path, $rascunho) {
                $estagio = Estagio::whereKey($estagio->id)->lockForUpdate()->firstOrFail();
                if ($rascunho) {
                    $this->autorizarEdicao($request, $estagio, $data['tipo']);
                } elseif ($estagio->estaFinalizado()) {
                    throw ValidationException::withMessages(['estagio' => 'Estágio finalizado não aceita documentos.']);
                }
                if ($estagio->documentos()->where('tipo', $data['tipo'])->whereIn('status', ['EM_ANALISE', 'DEFERIDO'])->exists()) {
                    throw ValidationException::withMessages(['tipo' => 'Já existe documento deste tipo em análise ou deferido.']);
                }
                $documento = new Documento;
                $documento->forceFill(['estagio_id' => $estagio->id, 'tipo' => $data['tipo'], 'status' => $rascunho ? StatusDocumento::PENDENTE : StatusDocumento::EM_ANALISE,
                    'arquivo_path' => $path, 'arquivo_nome' => 'documento.pdf', 'arquivo_mime' => $file->getMimeType(), 'arquivo_tamanho' => $file->getSize(), 'enviado_por' => $request->user()->id])->save();
                $this->historico($documento, $request->user()->id);

                return $documento;
            });
        } catch (\Throwable $exception) {
            Storage::disk('local')->delete($path);
            throw $exception;
        }

        return $this->successResponse($documento, $rascunho ? 'Arquivo salvo.' : 'Documento enviado para análise.', 201);
    }

    public function review(Request $request, Estagio $estagio, Documento $documento): JsonResponse
    {
        Gate::authorize('review', $estagio);
        abort_unless($documento->estagio_id === $estagio->id, 404);
        $data = $request->validate(['status' => ['required', Rule::in(['DEFERIDO', 'NECESSITA_AJUSTES'])], 'observacoes' => 'required_if:status,NECESSITA_AJUSTES|nullable|string|max:2000']);

        return DB::transaction(function () use ($request, $estagio, $documento, $data) {
            $estagio = Estagio::whereKey($estagio->id)->lockForUpdate()->firstOrFail();
            Gate::authorize('review', $estagio);
            $documento = Documento::whereKey($documento->id)->lockForUpdate()->firstOrFail();
            if (($estagio->estaFinalizado() && !str_starts_with($documento->tipo->value, 'AVALIACAO_')) || $documento->status !== StatusDocumento::EM_ANALISE || ! $documento->arquivo_path) {
                throw ValidationException::withMessages(['status' => 'Documento não pode ser analisado neste estado.']);
            }
            $documento->forceFill($data + ['analisado_por' => $request->user()->id, 'analisado_em' => now()])->save();
            $this->historico($documento, $request->user()->id);

            return $this->successResponse($documento);
        });
    }

    private function historico(Documento $documento, int $autor): void
    {
        DB::table('historico_documentos')->insert(['documento_id' => $documento->id, 'usuario_id' => $autor, 'status' => $documento->status->value, 'observacoes' => $documento->observacoes, 'created_at' => now()]);
    }

    public function history(Request $request, Estagio $estagio, Documento $documento): JsonResponse
    {
        Gate::authorize('view', $estagio);
        abort_unless($documento->estagio_id === $estagio->id, 404);

        return $this->successResponse(DB::table('historico_documentos')->where('documento_id', $documento->id)->orderByDesc('id')->paginate(20));
    }

    public function download(Estagio $estagio, Documento $documento): StreamedResponse
    {
        Gate::authorize('view', $estagio);
        abort_unless($documento->estagio_id === $estagio->id && $documento->arquivo_path, 404);
        abort_unless(Storage::disk('local')->exists($documento->arquivo_path), 404);

        return Storage::disk('local')->download($documento->arquivo_path, 'documento-'.$documento->id.'.pdf', ['Content-Type' => 'application/pdf', 'X-Content-Type-Options' => 'nosniff']);
    }
}

<?php

namespace App\Http\Controllers;

use App\Enums\StatusDocumento;
use App\Enums\TipoDocumento;
use App\Models\Documento;
use App\Models\Estagio;
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
    public function index(Request $request, Estagio $estagio): JsonResponse
    {
        Gate::authorize('view', $estagio);
        $data = $request->validate(['per_page' => 'sometimes|integer|min:1|max:100']);

        return $this->successResponse($estagio->documentos()->latest('id')->paginate($data['per_page'] ?? 20));
    }

    public function store(Request $request, Estagio $estagio): JsonResponse
    {
        Gate::authorize('submit', $estagio);
        $data = $request->validate(['tipo' => ['required', Rule::enum(TipoDocumento::class)], 'arquivo' => 'required|file|mimes:pdf|max:10240']);
        $file = $request->file('arquivo');
        $path = $file->store('documentos', 'local');
        abort_unless($path, 500, 'Não foi possível armazenar o documento.');
        try {
            $documento = DB::transaction(function () use ($estagio, $data, $request, $file, $path) {
                $estagio = Estagio::whereKey($estagio->id)->lockForUpdate()->firstOrFail();
                if ($estagio->estaFinalizado()) {
                    throw ValidationException::withMessages(['estagio' => 'Estágio finalizado não aceita documentos.']);
                }
                if ($estagio->documentos()->where('tipo', $data['tipo'])->whereIn('status', ['EM_ANALISE', 'DEFERIDO'])->exists()) {
                    throw ValidationException::withMessages(['tipo' => 'Já existe documento deste tipo em análise ou deferido.']);
                }
                $documento = new Documento;
                $documento->forceFill(['estagio_id' => $estagio->id, 'tipo' => $data['tipo'], 'status' => StatusDocumento::EM_ANALISE,
                    'arquivo_path' => $path, 'arquivo_nome' => 'documento.pdf', 'arquivo_mime' => $file->getMimeType(), 'arquivo_tamanho' => $file->getSize(), 'enviado_por' => $request->user()->id])->save();
                $this->historico($documento, $request->user()->id);

                return $documento;
            });
        } catch (\Throwable $exception) {
            Storage::disk('local')->delete($path);
            throw $exception;
        }

        return $this->successResponse($documento, 'Documento enviado para análise.', 201);
    }

    public function review(Request $request, Estagio $estagio, Documento $documento): JsonResponse
    {
        Gate::authorize('review', $estagio);
        abort_unless($documento->estagio_id === $estagio->id, 404);
        $data = $request->validate(['status' => ['required', Rule::in(['DEFERIDO', 'NECESSITA_AJUSTES'])], 'observacoes' => 'required_if:status,NECESSITA_AJUSTES|nullable|string|max:2000']);

        return DB::transaction(function () use ($request, $estagio, $documento, $data) {
            $estagio = Estagio::whereKey($estagio->id)->lockForUpdate()->firstOrFail();
            $documento = Documento::whereKey($documento->id)->lockForUpdate()->firstOrFail();
            if ($estagio->estaFinalizado() || $documento->status !== StatusDocumento::EM_ANALISE || ! $documento->arquivo_path) {
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

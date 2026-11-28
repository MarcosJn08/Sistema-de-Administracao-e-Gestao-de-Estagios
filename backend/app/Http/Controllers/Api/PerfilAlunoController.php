<?php

namespace App\Http\Controllers\Api;

use App\Enums\StatusDocumento;
use App\Enums\TipoDocumento;
use App\Http\Controllers\Controller;
use App\Models\Aluno;
use App\Models\Documento;
use App\Services\PerfilAlunoService;
use Dompdf\Dompdf;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpFoundation\StreamedResponse;

class PerfilAlunoController extends Controller
{
    public function __construct(private readonly PerfilAlunoService $service) {}

    private function aluno(Request $request): Aluno
    {
        abort_unless($request->user()->temPerfil('ALUNO'), 403);
        return Aluno::with(['usuario', 'turma.curso'])->where('usuario_id', $request->user()->id)->firstOrFail();
    }

    private function ficha(Aluno $aluno): ?Documento
    {
        return Documento::where('aluno_id', $aluno->id)->where('tipo', TipoDocumento::FICHA_MATRICULA->value)->latest('id')->first();
    }

    public function show(Request $request): JsonResponse
    {
        $aluno = $this->aluno($request);
        return response()->json(['data' => [
            'institucional' => ['nome' => $aluno->usuario->nome, 'email' => $aluno->usuario->email, 'cpf' => $aluno->cpf, 'matricula' => $aluno->matricula,
                'curso' => $aluno->turma?->curso?->nome ?? $aluno->curso_nome, 'turma' => $aluno->turma?->nome],
            'perfil' => $aluno->dados_perfil ?? [], 'checklist' => $this->service->checklist($aluno), 'ficha' => $this->ficha($aluno),
        ]]);
    }

    public function update(Request $request): JsonResponse
    {
        $aluno = $this->aluno($request);
        $dados = $this->validarDados($request);
        $aluno->dados_perfil = array_merge($aluno->dados_perfil ?? [], $dados);
        if (array_key_exists('telefone', $dados)) $aluno->telefone = $dados['telefone'];
        $aluno->save();
        return $this->show($request);
    }

    private function validarDados(Request $request): array
    {
        $rules = [];
        foreach ([...array_merge(...array_values(PerfilAlunoService::CAMPOS)), 'tipo_curso', 'telefone_fixo', 'complemento', 'integralizou', 'semestre_integralizacao'] as $campo) {
            $rules[$campo] = ['sometimes', 'nullable', 'string', 'max:255'];
        }
        $rules['data_nascimento'] = ['sometimes', 'nullable', 'date', 'before:today'];
        $rules['uf'] = $rules['uf_naturalidade'] = ['sometimes', 'nullable', Rule::in(explode(' ', 'AC AL AP AM BA CE DF ES GO MA MT MS MG PA PB PR PE PI RJ RN RS RO RR SC SP SE TO'))];
        $rules['cep'] = ['sometimes', 'nullable', 'regex:/^\d{5}-?\d{3}$/'];
        $rules['tipo_curso'] = ['sometimes', 'nullable', Rule::in(['Técnico', 'Superior'])];
        $rules['identidade'] = ['sometimes', 'nullable', 'regex:/^[0-9Xx.\-]{1,20}$/'];
        $rules['numero'] = ['sometimes', 'nullable', 'regex:/^[0-9a-zA-Z\/ -]{1,15}$/'];
        $rules['orgao_expedidor'] = ['sometimes', 'nullable', 'regex:/^[a-zA-Z\/ -]{1,20}$/'];
        foreach (['formacao', 'curso', 'turma_id', 'matricula', 'cpf', 'email', 'nome', 'usuario_id'] as $campo) $rules[$campo] = ['prohibited'];
        return $request->validate($rules);
    }

    public function pdf(Request $request): Response
    {
        $aluno = $this->aluno($request);
        $dados = $aluno->dados_perfil ?? [];
        if ($request->isMethod('post')) $dados = array_merge($dados, $this->validarDados($request));
        $html = view('pdf.ficha-matricula', ['aluno' => $aluno, 'dados' => $dados])->render();
        $pdf = new Dompdf(['isRemoteEnabled' => false, 'defaultFont' => 'DejaVu Sans']);
        $pdf->loadHtml($html);
        $pdf->setPaper('a4');
        $pdf->render();
        return response($pdf->output(), 200, ['Content-Type' => 'application/pdf', 'Content-Disposition' => 'attachment; filename="ficha-matricula-estagio.pdf"', 'X-Content-Type-Options' => 'nosniff']);
    }

    public function upload(Request $request): JsonResponse
    {
        $aluno = $this->aluno($request);
        $request->validate(['arquivo' => ['required', 'file', 'mimes:pdf', 'max:10240']]);
        $atual = $this->ficha($aluno);
        if ($atual && in_array($atual->status, [StatusDocumento::EM_ANALISE, StatusDocumento::DEFERIDO], true)) {
            throw ValidationException::withMessages(['arquivo' => 'A ficha enviada já está em análise ou aprovada.']);
        }
        $file = $request->file('arquivo');
        $path = $file->store('documentos/fichas', 'local');
        try {
            $documento = DB::transaction(function () use ($aluno, $file, $path, $request) {
                $documento = new Documento;
                $documento->forceFill(['aluno_id' => $aluno->id, 'tipo' => TipoDocumento::FICHA_MATRICULA, 'status' => StatusDocumento::PENDENTE,
                    'arquivo_path' => $path, 'arquivo_nome' => $file->getClientOriginalName(), 'arquivo_mime' => 'application/pdf',
                    'arquivo_tamanho' => $file->getSize(), 'enviado_por' => $request->user()->id])->save();
                return $documento;
            });
        } catch (\Throwable $e) { Storage::disk('local')->delete($path); throw $e; }
        return response()->json(['data' => $documento], 201);
    }

    public function submit(Request $request): JsonResponse
    {
        $aluno = $this->aluno($request);
        $ficha = $this->ficha($aluno);
        abort_unless($ficha && $ficha->status === StatusDocumento::PENDENTE, 422, 'Envie uma ficha pendente antes de encaminhar.');
        $ficha->status = StatusDocumento::EM_ANALISE;
        $ficha->save();
        DB::table('historico_documentos')->insert(['documento_id' => $ficha->id, 'usuario_id' => $request->user()->id, 'status' => $ficha->status->value, 'created_at' => now()]);
        return response()->json(['data' => $ficha]);
    }

    public function download(Request $request): StreamedResponse
    {
        $aluno = $this->aluno($request);
        $ficha = $this->ficha($aluno);
        abort_unless($ficha?->arquivo_path && Storage::disk('local')->exists($ficha->arquivo_path), 404);
        return Storage::disk('local')->download($ficha->arquivo_path, 'ficha-matricula-enviada.pdf', ['Content-Type' => 'application/pdf']);
    }

    public function review(Request $request, Documento $documento): JsonResponse
    {
        abort_unless($request->user()->temPerfil('DIRETOR') && $documento->aluno_id && $documento->tipo === TipoDocumento::FICHA_MATRICULA, 403);
        $dados = $request->validate(['status' => ['required', Rule::in(['DEFERIDO', 'NECESSITA_AJUSTES'])], 'observacoes' => ['required_if:status,NECESSITA_AJUSTES', 'nullable', 'string', 'max:2000']]);
        abort_unless($documento->status === StatusDocumento::EM_ANALISE, 422);
        $documento->forceFill($dados + ['analisado_por' => $request->user()->id, 'analisado_em' => now()])->save();
        DB::table('historico_documentos')->insert(['documento_id' => $documento->id, 'usuario_id' => $request->user()->id, 'status' => $documento->status->value, 'observacoes' => $documento->observacoes, 'created_at' => now()]);
        return response()->json(['data' => $documento]);
    }

    public function directorDownload(Request $request, Documento $documento): StreamedResponse
    {
        abort_unless($request->user()->temPerfil('DIRETOR') && $documento->aluno_id && $documento->tipo === TipoDocumento::FICHA_MATRICULA, 403);
        abort_unless($documento->arquivo_path && Storage::disk('local')->exists($documento->arquivo_path), 404);
        return Storage::disk('local')->download($documento->arquivo_path, 'ficha-matricula-'.$documento->id.'.pdf', ['Content-Type' => 'application/pdf']);
    }

    public function pending(Request $request): JsonResponse
    {
        abort_unless($request->user()->temPerfil('DIRETOR'), 403);
        return response()->json(['data' => Documento::with('aluno.usuario')->whereNotNull('aluno_id')->where('tipo', TipoDocumento::FICHA_MATRICULA->value)->where('status', StatusDocumento::EM_ANALISE->value)->latest('id')->get()]);
    }
}

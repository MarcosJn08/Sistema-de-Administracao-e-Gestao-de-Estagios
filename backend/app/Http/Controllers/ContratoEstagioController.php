<?php

namespace App\Http\Controllers;

use App\Enums\StatusEstagio;
use App\Http\Requests\StoreEstagioRequest;
use App\Http\Requests\UpdateEstagioRequest;
use App\Http\Resources\EstagioResource;
use App\Models\Estagio;
use App\Models\SupervisorEmpresa;
use App\Services\EstagioService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rule;

class ContratoEstagioController extends Controller
{
    private const RELATIONS = ['aluno.usuario', 'curso', 'empresa', 'supervisor', 'orientador.usuario', 'apolice', 'plano', 'documentos'];

    public function index(Request $request)
    {
        Gate::authorize('viewAny', Estagio::class);
        $f = $request->validate(['curso_id' => 'sometimes|integer|exists:cursos,id', 'empresa_concedente_id' => 'sometimes|integer|exists:empresas_concedentes,id', 'status' => ['sometimes', Rule::enum(StatusEstagio::class)], 'per_page' => 'sometimes|integer|min:1|max:100', 'page' => 'sometimes|integer|min:1']);
        $query = Estagio::with(self::RELATIONS);
        if (! $request->user()->temPerfil('DIRETOR')) {
            $relation = match ($request->user()->role) {
                'aluno' => 'aluno', 'professor' => 'orientador', 'empresa' => 'supervisor', default => abort(403)
            };
            $query->whereHas($relation, fn ($q) => $q->where('usuario_id', $request->user()->id));
        }
        foreach (['curso_id', 'empresa_concedente_id', 'status'] as $campo) {
            if (isset($f[$campo])) {
                $query->where($campo, $f[$campo]);
            }
        }

        return EstagioResource::collection($query->latest('id')->paginate($f['per_page'] ?? 20));
    }

    public function store(StoreEstagioRequest $request, EstagioService $service)
    {
        $path = $request->file('termo_formalizado')->store('documentos', 'local');
        abort_unless($path, 500);
        try {
            $estagio = DB::transaction(function () use ($request, $service, $path) {
                if ($request->user()->temPerfil('EMPRESA')) {
                    $supervisor = SupervisorEmpresa::whereKey($request->validated('supervisor_empresa_id'))->lockForUpdate()->firstOrFail();
                    abort_unless(
                        $supervisor->usuario_id === $request->user()->id
                        && $supervisor->empresa_concedente_id === (int) $request->validated('empresa_concedente_id'),
                        403,
                    );
                }
                $estagio = $service->criar($request->safe()->except('termo_formalizado'));
                $file = $request->file('termo_formalizado');
                $doc = $estagio->documentos()->make();
                $doc->forceFill(['tipo' => 'TCE', 'status' => 'EM_ANALISE', 'arquivo_path' => $path, 'arquivo_nome' => 'termo.pdf', 'arquivo_mime' => $file->getMimeType(), 'arquivo_tamanho' => $file->getSize(), 'enviado_por' => $request->user()->id])->save();
                DB::table('historico_documentos')->insert(['documento_id' => $doc->id, 'usuario_id' => $request->user()->id, 'status' => 'EM_ANALISE', 'observacoes' => 'Termo formalizado apresentado na criação do contrato; sujeito à análise.', 'created_at' => now()]);

                return $service->transicionar($estagio, StatusEstagio::EM_ANALISE, $request->user()->id, null);
            });
        } catch (\Throwable $e) {
            Storage::disk('local')->delete($path);
            throw $e;
        }

        return (new EstagioResource($estagio->load(self::RELATIONS)))->response()->setStatusCode(201);
    }

    public function show(Estagio $estagio)
    {
        Gate::authorize('view', $estagio);

        return new EstagioResource($estagio->load(self::RELATIONS));
    }

    public function update(UpdateEstagioRequest $request, Estagio $estagio, EstagioService $service)
    {
        return new EstagioResource($service->atualizar($estagio, $request->validated())->load(self::RELATIONS));
    }
}

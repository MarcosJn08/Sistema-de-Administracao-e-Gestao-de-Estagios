<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Aluno;
use App\Services\PerfilAlunoService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class CandidaturaVagaController extends Controller
{
    public function __construct(private readonly PerfilAlunoService $perfis) {}

    public function store(Request $request): JsonResponse
    {
        abort_unless($request->user()->temPerfil('ALUNO'), 403);
        $dados = $request->validate(['vaga_id' => 'required|string|max:80', 'vaga' => 'required|string|max:255',
            'empresa' => 'required|string|max:255', 'carta_apresentacao' => 'required|string|max:2000']);
        $aluno = Aluno::where('usuario_id', $request->user()->id)->firstOrFail();
        if (! $this->perfis->checklist($aluno)['completo']) {
            throw ValidationException::withMessages(['perfil' => ['Conclua o perfil e envie a ficha de matrícula para análise antes de se candidatar.']]);
        }
        if (DB::table('candidaturas_vaga')->where('aluno_id', $aluno->id)->where('vaga_id', $dados['vaga_id'])->exists()) {
            throw ValidationException::withMessages(['vaga_id' => ['Você já se candidatou a esta vaga.']]);
        }
        $id = DB::table('candidaturas_vaga')->insertGetId(['aluno_id' => $aluno->id, ...$dados, 'created_at' => now(), 'updated_at' => now()]);
        return response()->json(['data' => ['id' => $id, 'status' => 'EM_ANALISE']], 201);
    }
}

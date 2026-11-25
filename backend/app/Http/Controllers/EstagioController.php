<?php

namespace App\Http\Controllers;

use App\Enums\ModalidadeEstagio;
use App\Enums\StatusEstagio;
use App\Enums\UserRole;
use App\Models\Estagio;
use App\Services\EstagioService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Gate;
use Illuminate\Validation\Rule;

class EstagioController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $data = $request->validate(['per_page' => 'sometimes|integer|min:1|max:100', 'status' => ['sometimes', Rule::enum(StatusEstagio::class)]]);
        $query = Estagio::query();
        $usuario = $request->user();
        if (! $usuario->temPerfil(UserRole::DIRETOR)) {
            $relation = match ($usuario->perfil) {
                UserRole::ALUNO => 'aluno', UserRole::PROFESSOR => 'orientador', UserRole::EMPRESA => 'supervisor'
            };
            $query->whereHas($relation, fn ($q) => $q->where('usuario_id', $usuario->id));
        }
        $query->when($data['status'] ?? null, fn ($q, $status) => $q->where('status', $status));

        return $this->successResponse($query->latest('id')->paginate($data['per_page'] ?? 20));
    }

    public function store(Request $request, EstagioService $service): JsonResponse
    {
        abort_unless($request->user()->temPerfil(UserRole::DIRETOR), 403);
        $data = $request->validate([
            'aluno_id' => 'required|integer|exists:alunos,id', 'empresa_concedente_id' => 'required|integer|exists:empresas_concedentes,id',
            'professor_orientador_id' => 'required|integer|exists:professores_orientadores,id', 'supervisor_empresa_id' => 'required|integer|exists:supervisores_empresa,id',
            'modalidade' => ['required', Rule::enum(ModalidadeEstagio::class)], 'data_inicio' => 'required|date_format:Y-m-d',
            'data_termino' => 'required|date_format:Y-m-d|after_or_equal:data_inicio', 'carga_horaria_diaria' => 'required|numeric|gt:0|max:24|decimal:0,2',
            'bolsa_auxilio' => 'nullable|numeric|min:0|max:99999999.99|decimal:0,2', 'status' => 'prohibited',
        ]);

        return $this->successResponse($service->criar($data), 'Estágio criado.', 201);
    }

    public function show(Estagio $estagio): JsonResponse
    {
        Gate::authorize('view', $estagio);

        return $this->successResponse(['estagio' => $estagio->load('aluno.turma.curso', 'empresa', 'orientador', 'supervisor', 'apolice', 'plano', 'salubridade', 'relatorio', 'avaliacoes'), 'horas_cumpridas' => $estagio->horasCumpridas(), 'historico' => DB::table('historico_estagios')->where('estagio_id', $estagio->id)->orderBy('id')->get()]);
    }

    public function status(Request $request, Estagio $estagio, EstagioService $service): JsonResponse
    {
        Gate::authorize('transition', $estagio);
        $data = $request->validate(['status' => ['required', Rule::enum(StatusEstagio::class)], 'motivo' => 'nullable|string|max:2000']);

        return $this->successResponse($service->transicionar($estagio, StatusEstagio::from($data['status']), $request->user()->id, $data['motivo'] ?? null));
    }
}

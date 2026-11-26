<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\CursoRequest;
use App\Http\Resources\CursoResource;
use App\Models\Curso;
use App\Services\CursoService;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class CursoController extends Controller
{
    use AuthorizesRequests;

    public function __construct(
        protected CursoService $service
    ) {}

    public function index(Request $request): AnonymousResourceCollection
    {
        $this->authorize('viewAny', Curso::class);
        $request->validate([
            'per_page' => ['sometimes', 'integer', 'min:1', 'max:100'],
            'status'   => ['sometimes', 'string', 'in:ativo,inativo'],
        ]);
        $cursos = $this->service->listar($request->all());
        return CursoResource::collection($cursos);
    }

    public function store(CursoRequest $request): JsonResponse
    {
        $this->authorize('create', Curso::class);
        $curso = $this->service->criar($request->validated());
        return (new CursoResource($curso))
            ->response()
            ->setStatusCode(201);
    }

    public function show(Curso $curso): CursoResource
    {
        $this->authorize('view', $curso);
        return new CursoResource($curso);
    }

    public function update(CursoRequest $request, Curso $curso): CursoResource
    {
        $this->authorize('update', $curso);
        $atualizado = $this->service->atualizar($curso, $request->validated());
        return new CursoResource($atualizado);
    }

    public function destroy(Curso $curso): JsonResponse
    {
        $this->authorize('delete', $curso);
        $this->service->excluir($curso);
        return response()->json([
            'message' => 'Curso excluído com sucesso.',
        ], 200);
    }
}

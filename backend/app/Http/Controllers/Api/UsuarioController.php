<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreUserRequest;
use App\Http\Requests\UpdateUserRequest;
use App\Http\Resources\UsuarioResource;
use App\Models\Usuario;
use App\Services\UserService;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class UsuarioController extends Controller
{
    use AuthorizesRequests;
    public function __construct(private readonly UserService $service) {}

    public function index(Request $request): AnonymousResourceCollection
    {
        $this->authorize('viewAny', Usuario::class);

        $filtros = $request->validate([
            'perfil'   => ['sometimes', 'string', 'in:ALUNO,PROFESSOR,DIRETOR,EMPRESA,aluno,professor,diretor,empresa'],
            'status'   => ['sometimes', 'string', 'in:ativo,inativo'],
            'curso'    => ['sometimes', 'string', 'max:100'],
            'busca'    => ['sometimes', 'string', 'max:200'],
            'per_page' => ['sometimes', 'integer', 'min:1', 'max:100'],
        ]);

        return UsuarioResource::collection($this->service->listar($filtros));
    }

    public function store(StoreUserRequest $request): JsonResponse
    {
        $this->authorize('create', Usuario::class);

        $usuario = $this->service->criar($request->validated());

        return (new UsuarioResource($usuario))
            ->additional(['success' => true, 'message' => 'Usuário criado com sucesso.', 'errors' => []])
            ->response()
            ->setStatusCode(201);
    }

    public function show(Request $request, Usuario $usuario): UsuarioResource
    {
        $this->authorize('view', $usuario);

        return (new UsuarioResource($usuario))
            ->additional(['success' => true, 'message' => 'Usuário encontrado.', 'errors' => []]);
    }

    public function update(UpdateUserRequest $request, Usuario $usuario): UsuarioResource
    {
        $this->authorize('update', $usuario);

        $atualizado = $this->service->atualizar($usuario, $request->validated(), $request->user()->id);

        return (new UsuarioResource($atualizado))
            ->additional(['success' => true, 'message' => 'Usuário atualizado com sucesso.', 'errors' => []]);
    }

    public function destroy(Request $request, Usuario $usuario): JsonResponse
    {
        $this->authorize('delete', $usuario);

        $this->service->inativar($usuario, $request->user()->id);

        return response()->json([
            'success' => true,
            'message' => 'Usuário inativado com sucesso.',
            'data'    => null,
            'errors'  => [],
        ]);
    }
}

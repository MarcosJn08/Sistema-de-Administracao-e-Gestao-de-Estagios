<?php

namespace App\Http\Controllers;

use App\Http\Docs\Orientacao\OrientadorDocs;
use App\Http\Requests\VincularOrientadorRequest;
use App\Http\Resources\DiscenteOrientadoResource;
use App\Http\Resources\OrientadorResource;
use App\Models\Estagio;
use App\Services\OrientadorService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class OrientadorEstagioController extends Controller
{
    use OrientadorDocs;

    public function index(OrientadorService $service): JsonResponse
    {
        return $this->successResponse([
            'orientadores' => OrientadorResource::collection($service->listar()),
            'discentes_sem_orientador' => DiscenteOrientadoResource::agrupar($service->semOrientador()),
        ]);
    }

    public function vincular(VincularOrientadorRequest $request, Estagio $estagio, OrientadorService $service): JsonResponse
    {
        $estagio = $service->vincular($estagio, $request->integer('professor_orientador_id'));

        return $this->successResponse([
            'id' => $estagio->id,
            'professor_orientador_id' => $estagio->professor_orientador_id,
        ], 'Orientador vinculado com sucesso.');
    }

    public function meusDiscentes(Request $request, OrientadorService $service): JsonResponse
    {
        return $this->successResponse(DiscenteOrientadoResource::agrupar($service->estagiosDoProfessor($request->user())));
    }
}

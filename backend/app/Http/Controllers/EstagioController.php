<?php

namespace App\Http\Controllers;

use App\Enums\StatusEstagio;
use App\Models\Estagio;
use App\Services\EstagioService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Illuminate\Validation\Rule;

class EstagioController extends Controller
{
    public function status(Request $request, Estagio $estagio, EstagioService $service): JsonResponse
    {
        Gate::authorize('transition', $estagio);
        $data = $request->validate(['status' => ['required', Rule::enum(StatusEstagio::class)], 'motivo' => 'nullable|string|max:2000']);

        return $this->successResponse($service->transicionar($estagio, StatusEstagio::from($data['status']), $request->user()->id, $data['motivo'] ?? null));
    }
}


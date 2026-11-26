<?php

namespace App\Services;

use App\Models\Curso;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Validation\ValidationException;

class CursoService
{
    public function listar(array $filtros = []): Collection|LengthAwarePaginator
    {
        $query = Curso::query();

        if (! empty($filtros['busca'])) {
            $busca = $filtros['busca'];
            $query->where(function ($q) use ($busca) {
                $q->where('nome', 'like', "%{$busca}%")
                  ->orWhere('codigo', 'like', "%{$busca}%");
            });
        }

        if (! empty($filtros['modalidade'])) {
            $query->where('modalidade', $filtros['modalidade']);
        }

        if (! empty($filtros['status'])) {
            $query->where('status', $filtros['status']);
        }

        if (isset($filtros['per_page'])) {
            return $query->paginate((int) $filtros['per_page']);
        }

        return $query->get();
    }

    public function buscar(int $id): Curso
    {
        return Curso::findOrFail($id);
    }

    public function criar(array $dados): Curso
    {
        return Curso::create($dados);
    }

    public function atualizar(Curso $curso, array $dados): Curso
    {
        $curso->update($dados);
        return $curso->fresh();
    }

    public function excluir(Curso $curso): void
    {
        if ($curso->temEstagiosVinculados()) {
            throw ValidationException::withMessages([
                'curso' => 'Não é possível excluir o curso pois existem estágios vinculados a ele.',
            ]);
        }

        $curso->delete();
    }
}

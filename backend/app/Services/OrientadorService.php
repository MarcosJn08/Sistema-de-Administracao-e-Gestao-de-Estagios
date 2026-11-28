<?php

namespace App\Services;

use App\Models\Estagio;
use App\Models\ProfessorOrientador;
use App\Models\User;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class OrientadorService
{
    public function listar(): Collection
    {
        return ProfessorOrientador::query()
            ->with(['usuario', 'estagios' => fn ($estagios) => $this->carregarEstagios($estagios)])
            ->withCount('estagiosAtivos')
            ->orderBy('departamento_area')
            ->orderBy('id')
            ->get();
    }

    public function semOrientador(): Collection
    {
        return $this->carregarEstagios(Estagio::query())
            ->whereNull('professor_orientador_id')
            ->get();
    }

    public function estagiosDoProfessor(User $usuario): Collection
    {
        return $this->carregarEstagios(Estagio::query())
            ->whereHas('orientador', fn (Builder $query) => $query->where('usuario_id', $usuario->id))
            ->get();
    }

    private function carregarEstagios($query)
    {
        return $query->with(['aluno.usuario' => fn ($usuario) => $usuario->withTrashed(), 'aluno.turma.curso', 'empresa', 'supervisor', 'documentos'])
            ->withSum(['frequencias as horas_cumpridas' => fn (Builder $query) => $query->where('assinado_supervisor', true)], 'horas_diarias')
            ->orderByDesc('id');
    }

    public function vincular(Estagio $estagio, int $orientadorId): Estagio
    {
        return DB::transaction(function () use ($estagio, $orientadorId): Estagio {
            $estagio = Estagio::whereKey($estagio->id)->lockForUpdate()->firstOrFail();
            $orientador = ProfessorOrientador::whereKey($orientadorId)->lockForUpdate()->first();
            $orientador?->setRelation('usuario', $orientador->usuario()->lockForUpdate()->first());

            if (! $orientador?->contaAtiva()) {
                throw ValidationException::withMessages(['professor_orientador_id' => 'Selecione um orientador com conta ativa.']);
            }

            if ($estagio->professor_orientador_id === $orientador->id) {
                return $estagio;
            }

            if ($estagio->estaFinalizado()) {
                throw ValidationException::withMessages(['estagio' => 'O orientador de um estágio finalizado não pode ser alterado.']);
            }

            if (! $orientador->podeOrientarMais()) {
                throw ValidationException::withMessages(['professor_orientador_id' => 'O professor atingiu o limite de orientados.']);
            }

            $estagio->orientador()->associate($orientador);
            $estagio->save();

            return $estagio;
        }, 3);
    }

    public function desvincular(Estagio $estagio): Estagio
    {
        return DB::transaction(function () use ($estagio): Estagio {
            $estagio = Estagio::whereKey($estagio->id)->lockForUpdate()->firstOrFail();

            if ($estagio->estaFinalizado()) {
                throw ValidationException::withMessages(['estagio' => 'O orientador de um estágio finalizado não pode ser alterado.']);
            }

            $estagio->orientador()->dissociate();
            $estagio->save();

            return $estagio;
        }, 3);
    }
}

<?php

namespace App\Services;

use App\Models\Aluno;
use App\Models\ProfessorOrientador;
use App\Models\Usuario;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class UserService
{
    public function listar(array $filtros): LengthAwarePaginator
    {
        $query = Usuario::withTrashed()->latest('id');

        if (! empty($filtros['perfil'])) {
            $query->where('perfil', strtoupper($filtros['perfil']));
        }

        if (! empty($filtros['status'])) {
            $query->where('status', $filtros['status']);
        }

        if (! empty($filtros['curso'])) {
            $curso = $filtros['curso'];
            $query->whereHas('aluno.turma.curso', function ($q) use ($curso): void {
                if (is_numeric($curso)) {
                    $q->where('id', (int) $curso);
                } else {
                    $q->whereRaw('LOWER(nome) LIKE ?', ['%' . mb_strtolower($curso) . '%']);
                }
            });
        }

        if (! empty($filtros['busca'])) {
            $busca = '%'.mb_strtolower($filtros['busca']).'%';
            $query->where(function ($q) use ($busca): void {
                $q->whereRaw('LOWER(nome) LIKE ?', [$busca])
                    ->orWhereRaw('LOWER(email) LIKE ?', [$busca])
                    ->orWhereRaw('LOWER(COALESCE(matricula, \'\')) LIKE ?', [$busca])
                    ->orWhereRaw('LOWER(COALESCE(siape, \'\')) LIKE ?', [$busca])
                    ->orWhereRaw('LOWER(COALESCE(cpf, \'\')) LIKE ?', [$busca]);
            });
        }

        return $query->paginate((int) ($filtros['per_page'] ?? 20));
    }

    public function criar(array $dados): Usuario
    {
        return DB::transaction(function () use ($dados): Usuario {
            $usuario = Usuario::create($dados);

            $perfil = strtoupper((string) ($usuario->perfil instanceof \BackedEnum ? $usuario->perfil->value : ($usuario->perfil ?? $usuario->role)));

            if ($perfil === 'ALUNO') {
                Aluno::updateOrCreate(
                    ['usuario_id' => $usuario->id],
                    [
                        'matricula'  => $usuario->matricula ?? ('M' . $usuario->id),
                        'cpf'        => $usuario->cpf ?? ('000000000' . str_pad((string) $usuario->id, 2, '0', STR_PAD_LEFT)),
                        'turma_id'   => $dados['turma_id'] ?? null,
                        'telefone'   => $dados['telefone'] ?? null,
                        'curso_nome' => $dados['curso'] ?? $dados['curso_nome'] ?? null,
                    ]
                );
            } elseif ($perfil === 'PROFESSOR') {
                ProfessorOrientador::updateOrCreate(
                    ['usuario_id' => $usuario->id],
                    [
                        'siape_matricula'   => $usuario->siape ?? ('S' . $usuario->id),
                        'departamento_area' => $dados['departamento'] ?? $dados['departamento_area'] ?? 'Informática',
                        'titulacao'         => $dados['titulacao'] ?? null,
                        'telefone'          => $dados['telefone'] ?? null,
                        'area_atuacao'      => $dados['areaAtuacao'] ?? $dados['area_atuacao'] ?? null,
                        'regime_trabalho'   => $dados['regimeTrabalho'] ?? $dados['regime_trabalho'] ?? null,
                        'max_orientados'    => (int) ($dados['maximoOrientandos'] ?? $dados['max_orientados'] ?? 5),
                    ]
                );
            }

            return $usuario;
        });
    }

    public function atualizar(Usuario $usuario, array $dados, int $authUserId): Usuario
    {
        return DB::transaction(function () use ($usuario, $dados, $authUserId): Usuario {
            $usuario = Usuario::query()->whereKey($usuario->id)->lockForUpdate()->firstOrFail();

            $perfilAtual = $usuario->perfil instanceof \BackedEnum
                ? $usuario->perfil->value
                : strtoupper((string) $usuario->perfil);

            if (isset($dados['perfil']) && strtoupper($dados['perfil']) !== $perfilAtual) {
                throw ValidationException::withMessages(['perfil' => 'O perfil de uma conta existente não pode ser alterado.']);
            }

            if ($usuario->id === $authUserId && ($dados['status'] ?? 'ativo') !== 'ativo') {
                throw ValidationException::withMessages(['status' => 'Você não pode desativar a própria conta.']);
            }

            if (isset($dados['status'])) {
                $dados['is_active'] = $dados['status'] === 'ativo';
            }

            $usuario->update($dados);

            $perfil = strtoupper((string) ($usuario->perfil instanceof \BackedEnum ? $usuario->perfil->value : ($usuario->perfil ?? $usuario->role)));
            if ($perfil === 'PROFESSOR') {
                $camposProfessor = array_filter([
                    'siape_matricula'   => $usuario->siape,
                    'departamento_area' => $dados['departamento'] ?? $dados['departamento_area'] ?? null,
                    'titulacao'         => $dados['titulacao'] ?? null,
                    'telefone'          => $dados['telefone'] ?? null,
                    'area_atuacao'      => $dados['areaAtuacao'] ?? $dados['area_atuacao'] ?? null,
                    'regime_trabalho'   => $dados['regimeTrabalho'] ?? $dados['regime_trabalho'] ?? null,
                    'max_orientados'    => isset($dados['maximoOrientandos']) || isset($dados['max_orientados']) ? (int) ($dados['maximoOrientandos'] ?? $dados['max_orientados']) : null,
                ], fn ($val) => $val !== null);

                if (! empty($camposProfessor)) {
                    if (isset($camposProfessor['max_orientados'])) {
                        $orientador = ProfessorOrientador::where('usuario_id', $usuario->id)->lockForUpdate()->first();
                        if ($orientador && $camposProfessor['max_orientados'] < $orientador->estagiosAtivos()->count()) {
                            throw ValidationException::withMessages([
                                'maximoOrientandos' => 'O limite não pode ser menor que o número de estágios ativos.',
                            ]);
                        }
                    }
                    ProfessorOrientador::updateOrCreate(['usuario_id' => $usuario->id], $camposProfessor);
                }
            } elseif ($perfil === 'ALUNO') {
                $camposAluno = array_filter([
                    'matricula'  => $usuario->matricula,
                    'cpf'        => $usuario->cpf,
                    'telefone'   => $dados['telefone'] ?? null,
                    'curso_nome' => $dados['curso'] ?? $dados['curso_nome'] ?? null,
                ], fn ($val) => $val !== null);

                if (! empty($camposAluno)) {
                    Aluno::updateOrCreate(['usuario_id' => $usuario->id], $camposAluno);
                }
            }

            if (isset($dados['password']) || ($dados['status'] ?? null) === 'inativo') {
                $usuario->tokens()->delete();
            }

            return $usuario->refresh();
        }, 3);
    }

    public function inativar(Usuario $usuario, int $authUserId): void
    {
        if ($usuario->id === $authUserId) {
            throw ValidationException::withMessages(['id' => 'Você não pode inativar a própria conta.']);
        }

        DB::transaction(function () use ($usuario): void {
            $usuario->update(['status' => 'inativo', 'is_active' => false]);
            $usuario->tokens()->delete();
            $usuario->delete();
        });
    }
}

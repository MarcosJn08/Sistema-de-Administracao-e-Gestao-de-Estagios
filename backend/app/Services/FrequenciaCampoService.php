<?php

namespace App\Services;

use App\Enums\ModalidadeEstagio;
use App\Enums\StatusEstagio;
use App\Models\Aluno;
use App\Models\Estagio;
use App\Models\FrequenciaDiariaCampo;
use App\Models\ProfessorOrientador;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class FrequenciaCampoService
{
    public function listarTurmasEEstagiarios(User $user): array
    {
        $query = Estagio::with(['aluno.usuario', 'aluno.turma.curso', 'empresa', 'supervisor'])
            ->where('status', StatusEstagio::EM_ANDAMENTO)
            ->where(function ($q) {
                $q->where('modalidade', ModalidadeEstagio::SUPERVISIONADO_CAMPO)
                  ->orWhereHas('aluno.turma.curso', function ($cq) {
                      $cq->where('modalidade_estagio', 'supervisionado_campo')
                         ->orWhere('nome', 'like', '%Enfermagem%');
                  });
            });

        if ($user->role === 'professor' && $user->professor) {
            $query->where('professor_orientador_id', $user->professor->id);
        }

        $estagios = $query->get();

        $turmasAgrupadas = [];
        foreach ($estagios as $estagio) {
            $turma = $estagio->aluno->turma;
            $turmaNome = $turma ? $turma->nome : ($estagio->aluno->curso_nome ?? 'Geral');
            $turmaId = $turma ? $turma->id : 0;

            if (! isset($turmasAgrupadas[$turmaId])) {
                $turmasAgrupadas[$turmaId] = [
                    'turma_id' => $turmaId,
                    'turma_nome' => $turmaNome,
                    'curso' => $turma && $turma->curso ? $turma->curso->nome : ($estagio->aluno->curso_nome ?? 'Campo'),
                    'estagiarios' => [],
                ];
            }

            $turmasAgrupadas[$turmaId]['estagiarios'][] = [
                'estagio_id' => $estagio->id,
                'aluno_id' => $estagio->aluno_id,
                'nome' => $estagio->aluno->usuario->nome ?? $estagio->aluno->usuario->name ?? 'Estudante',
                'matricula' => $estagio->aluno->matricula,
                'empresa' => $estagio->empresa->razao_social ?? 'Campo de Estágio',
                'carga_horaria_diaria' => (float) $estagio->carga_horaria_diaria,
                'horas_cumpridas' => $estagio->horasCumpridas(),
                'horas_exigidas' => $estagio->aluno->cargaHorariaExigida(),
                'horas_restantes' => $estagio->aluno->cargaHorariaRestante(),
            ];
        }

        return array_values($turmasAgrupadas);
    }

    public function registrarLote(User $user, array $dados): array
    {
        $professorId = null;
        if ($user->professor) {
            $professorId = $user->professor->id;
        } elseif ($user->role === 'diretor') {
            $professorId = ProfessorOrientador::first()?->id ?? 1;
        }

        if (! $professorId) {
            throw ValidationException::withMessages([
                'professor' => ['Docente supervisor não localizado no sistema.'],
            ]);
        }

        $data = $dados['data'];
        $registros = $dados['registros'];

        return DB::transaction(function () use ($professorId, $data, $registros) {
            $salvos = [];

            foreach ($registros as $item) {
                $estagio = Estagio::with(['aluno.turma.curso'])->lockForUpdate()->findOrFail($item['estagio_id']);

                if ($estagio->status !== StatusEstagio::EM_ANDAMENTO) {
                    throw ValidationException::withMessages([
                        'estagio' => ["O estágio do aluno #{$item['aluno_id']} não está ativo."],
                    ]);
                }

                $maxHoras = (float) $estagio->carga_horaria_diaria;
                if ($item['presente'] && (float) $item['horas_cumpridas'] > $maxHoras) {
                    throw ValidationException::withMessages([
                        'horas_cumpridas' => ["As horas diárias ({$item['horas_cumpridas']}h) excedem o limite diário de {$maxHoras}h do estágio."],
                    ]);
                }

                $horasEfetivas = $item['presente'] ? (float) $item['horas_cumpridas'] : 0;

                $frequencia = FrequenciaDiariaCampo::updateOrCreate(
                    [
                        'estagio_id' => $estagio->id,
                        'data' => $data,
                    ],
                    [
                        'aluno_id' => $item['aluno_id'],
                        'professor_id' => $professorId,
                        'presente' => (bool) $item['presente'],
                        'horas_cumpridas' => $horasEfetivas,
                        'observacoes' => $item['observacoes'] ?? null,
                    ]
                );

                $salvos[] = [
                    'id' => $frequencia->id,
                    'aluno_id' => $item['aluno_id'],
                    'estagio_id' => $estagio->id,
                    'presente' => $frequencia->presente,
                    'horas_cumpridas' => (float) $frequencia->horas_cumpridas,
                    'saldo_atualizado' => $estagio->fresh()->horasCumpridas(),
                ];
            }

            return $salvos;
        });
    }

    public function historicoAluno(int $alunoId): array
    {
        $aluno = Aluno::with(['usuario', 'turma.curso'])->findOrFail($alunoId);

        $frequencias = FrequenciaDiariaCampo::with(['professor.usuario', 'estagio'])
            ->where('aluno_id', $alunoId)
            ->orderByDesc('data')
            ->get();

        $totalHorasCampo = (float) $frequencias->where('presente', true)->sum('horas_cumpridas');
        $totalPresencas = $frequencias->where('presente', true)->count();
        $totalFaltas = $frequencias->where('presente', false)->count();

        return [
            'aluno' => [
                'id' => $aluno->id,
                'nome' => $aluno->usuario->nome ?? $aluno->usuario->name ?? '',
                'matricula' => $aluno->matricula,
                'curso' => $aluno->turma && $aluno->turma->curso ? $aluno->turma->curso->nome : ($aluno->curso_nome ?? 'Enfermagem/Campo'),
                'total_horas_campo' => $totalHorasCampo,
                'total_presencas' => $totalPresencas,
                'total_faltas' => $totalFaltas,
                'saldo_restante' => $aluno->cargaHorariaRestante(),
            ],
            'extrato' => $frequencias->map(fn ($f) => [
                'id' => $f->id,
                'data' => $f->data->format('Y-m-d'),
                'presente' => (bool) $f->presente,
                'horas_cumpridas' => (float) $f->horas_cumpridas,
                'observacoes' => $f->observacoes,
                'professor_responsavel' => $f->professor->usuario->nome ?? $f->professor->usuario->name ?? 'Docente',
            ]),
        ];
    }
}

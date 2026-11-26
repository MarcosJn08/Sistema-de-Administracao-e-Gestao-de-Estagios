<?php

namespace App\Services;

use App\Enums\StatusDocumento;
use App\Enums\StatusEstagio;
use App\Enums\TipoDocumento;
use App\Models\Aluno;
use App\Models\EmpresaConcedente;
use App\Models\Estagio;
use App\Models\ProfessorOrientador;
use App\Models\SupervisorEmpresa;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class EstagioService
{
    public function criar(array $dados): Estagio
    {
        return DB::transaction(function () use ($dados) {
            $empresa = EmpresaConcedente::whereKey($dados['empresa_concedente_id'])->lockForUpdate()->firstOrFail();
            $orientador = isset($dados['professor_orientador_id'])
                ? ProfessorOrientador::whereKey($dados['professor_orientador_id'])->lockForUpdate()->firstOrFail()
                : null;
            $aluno = Aluno::findOrFail($dados['aluno_id']);
            $supervisor = SupervisorEmpresa::findOrFail($dados['supervisor_empresa_id']);
            $this->validarVinculos($empresa, $orientador, $aluno, $supervisor);
            $dados['status'] = StatusEstagio::RASCUNHO;

            return Estagio::create($dados);
        });
    }

    private function validarVinculos(EmpresaConcedente $empresa, ?ProfessorOrientador $orientador, Aluno $aluno, SupervisorEmpresa $supervisor): void
    {
        if (! $empresa->convenioAtivo()) {
            throw ValidationException::withMessages(['empresa_concedente_id' => 'A empresa não possui convênio ativo.']);
        }
        if ($supervisor->empresa_concedente_id !== $empresa->id) {
            throw ValidationException::withMessages(['supervisor_empresa_id' => 'O supervisor não pertence à empresa.']);
        }
        $alunoAtivo = ($aluno->usuario->status instanceof \BackedEnum ? $aluno->usuario->status->value : $aluno->usuario->status) === 'ativo';
        $turmaAtiva = ($aluno->turma->status instanceof \BackedEnum ? $aluno->turma->status->value : $aluno->turma->status) === 'ativa';
        $cursoAtivo = ($aluno->turma->curso->status instanceof \BackedEnum ? $aluno->turma->curso->status->value : $aluno->turma->curso->status) === 'ativo';

        if (($orientador && ! $orientador->contaAtiva()) || ! $alunoAtivo || ! $turmaAtiva || ! $cursoAtivo) {
            throw ValidationException::withMessages(['estagio' => 'Aluno, orientador, curso e turma devem estar ativos.']);
        }
        if ($orientador && ! $orientador->podeOrientarMais()) {
            throw ValidationException::withMessages(['professor_orientador_id' => 'O professor atingiu o limite de orientados.']);
        }
    }

    public function transicionar(Estagio $estagio, StatusEstagio $destino, int $autor, ?string $motivo): Estagio
    {
        return DB::transaction(function () use ($estagio, $destino, $autor, $motivo) {
            $estagio = Estagio::whereKey($estagio->id)->lockForUpdate()->firstOrFail();
            $origem = $estagio->status;
            $permitidos = match ($origem) {
                StatusEstagio::RASCUNHO => [StatusEstagio::EM_ANDAMENTO, StatusEstagio::ENCERRADO],
                StatusEstagio::EM_ANDAMENTO => [StatusEstagio::CONCLUIDO, StatusEstagio::ENCERRADO, StatusEstagio::CANCELADO_DESVIO_FUNCAO],
                default => [],
            };
            if (! in_array($destino, $permitidos, true)) {
                throw ValidationException::withMessages(['status' => 'Transição de status não permitida.']);
            }
            if ($destino === StatusEstagio::EM_ANDAMENTO) {
                if ($estagio->professor_orientador_id === null) {
                    throw ValidationException::withMessages(['professor_orientador_id' => 'Vincule um orientador antes de ativar o estágio.']);
                }
                if ($estagio->data_termino->isBefore(today())) {
                    throw ValidationException::withMessages(['data_termino' => 'Não é possível ativar um estágio cujo período já terminou.']);
                }
                $empresa = EmpresaConcedente::whereKey($estagio->empresa_concedente_id)->lockForUpdate()->firstOrFail();
                $orientador = ProfessorOrientador::whereKey($estagio->professor_orientador_id)->lockForUpdate()->firstOrFail();
                $this->validarVinculos($empresa, $orientador, $estagio->aluno, $estagio->supervisor);
                $tipos = [TipoDocumento::TCE->value, TipoDocumento::PLANO_ATIVIDADES->value, TipoDocumento::FICHA_MATRICULA->value];
                $aprovados = $estagio->documentos()->where('status', StatusDocumento::DEFERIDO)->whereIn('tipo', $tipos)->distinct()->count('tipo');
                if ($aprovados !== count($tipos) || ! $estagio->apolice()->exists() || ! $estagio->plano()->exists()) {
                    throw ValidationException::withMessages(['documentos' => 'A ativação exige TCE, plano de atividades e ficha de matrícula deferidos, além de apólice e plano cadastrados.']);
                }
            }
            if ($destino === StatusEstagio::CONCLUIDO && (! $estagio->relatorio()->where('aprovado', true)->exists()
                || $estagio->aluno->cargaHorariaRestante() > 0)) {
                throw ValidationException::withMessages(['status' => 'A conclusão exige relatório aprovado e carga horária do curso cumprida.']);
            }
            if (in_array($destino, [StatusEstagio::ENCERRADO, StatusEstagio::CANCELADO_DESVIO_FUNCAO], true) && ! $motivo) {
                throw ValidationException::withMessages(['motivo' => 'Informe o motivo do encerramento.']);
            }
            $estagio->update(['status' => $destino]);
            DB::table('historico_estagios')->insert(['estagio_id' => $estagio->id, 'usuario_id' => $autor, 'status_anterior' => $origem->value, 'status_novo' => $destino->value, 'motivo' => $motivo, 'created_at' => now()]);

            return $estagio;
        }, 3);
    }
}

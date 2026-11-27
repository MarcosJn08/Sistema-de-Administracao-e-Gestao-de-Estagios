<?php

namespace App\Services;

use App\Models\Aluno;
use App\Models\Estagio;
use App\Models\SupervisorEmpresa;
use Carbon\Carbon;
use Illuminate\Validation\ValidationException;

class ContratoEstagioService
{
    private function fail(string $campo, string $mensagem): never
    {
        throw ValidationException::withMessages([$campo => $mensagem]);
    }

    public function validar(Estagio $contrato): void
    {
        Aluno::whereKey($contrato->aluno_id)->lockForUpdate()->firstOrFail();
        $supervisor = SupervisorEmpresa::whereKey($contrato->supervisor_empresa_id)->lockForUpdate()->firstOrFail();
        if ($supervisor->empresa_concedente_id != $contrato->empresa_concedente_id) {
            $this->fail('supervisor_empresa_id', 'O supervisor não pertence à empresa.');
        }
        if ($contrato->data_termino < $contrato->data_inicio) {
            $this->fail('data_termino', 'O término deve ser posterior ou igual ao início.');
        }
        if (! $contrato->carga_horaria_semanal || ! $contrato->meta_horas_tce) {
            $this->fail('meta_horas_tce', 'Preencha os limites contratuais antes de movimentar este estágio.');
        }
        if ($contrato->carga_horaria_diaria > $contrato->carga_horaria_semanal) {
            $this->fail('carga_horaria_diaria', 'A carga diária não pode exceder a semanal.');
        }
        $outros = Estagio::where('id', '!=', $contrato->id ?? 0)
            ->whereIn('status', ['RASCUNHO', 'EM_ANALISE', 'EM_ANDAMENTO'])
            ->whereDate('data_inicio', '<=', $contrato->data_termino)
            ->whereDate('data_termino', '>=', $contrato->data_inicio)
            ->where(fn ($q) => $q->where('aluno_id', $contrato->aluno_id)->orWhere('supervisor_empresa_id', $contrato->supervisor_empresa_id))->get();
        // Os conjuntos ativos só mudam no início de um contrato (términos apenas removem carga).
        $datas = [$contrato->data_inicio->toDateString()];
        foreach ($outros as $outro) {
            if ($outro->data_inicio >= $contrato->data_inicio) {
                $datas[] = $outro->data_inicio->toDateString();
            }
        }
        foreach (array_unique($datas) as $data) {
            $horas = (int) round((float) $contrato->carga_horaria_semanal * 100);
            $alunos = [$contrato->aluno_id => true];
            foreach ($outros as $outro) {
                if ($outro->data_inicio->toDateString() > $data || $outro->data_termino->toDateString() < $data) {
                    continue;
                }
                if ($outro->aluno_id == $contrato->aluno_id) {
                    if (! $outro->carga_horaria_semanal) {
                        $this->fail('carga_horaria_semanal', 'Regularize a carga semanal do outro contrato simultâneo deste aluno.');
                    }
                    $horas += (int) round((float) $outro->carga_horaria_semanal * 100);
                }
                if ($outro->supervisor_empresa_id == $contrato->supervisor_empresa_id) {
                    $alunos[$outro->aluno_id] = true;
                }
            }
            if ($horas > 3000) {
                $this->fail('carga_horaria_semanal', 'Os contratos simultâneos do aluno excedem 30 horas semanais.');
            }
            if (count($alunos) > 10) {
                $this->fail('supervisor_empresa_id', 'O supervisor excederia dez estagiários simultâneos.');
            }
        }
        if ($contrato->exists) {
            $total = 0;
            $semanas = [];
            foreach ($contrato->frequencias()->get() as $f) {
                if ($f->data < $contrato->data_inicio || $f->data > $contrato->data_termino) {
                    $this->fail('data_inicio', 'Existem frequências fora do período proposto.');
                }
                $valor = (int) round((float) $f->horas_diarias * 100);
                if ($valor > round((float) $contrato->carga_horaria_diaria * 100)) {
                    $this->fail('carga_horaria_diaria', 'Existem frequências superiores à carga diária proposta.');
                }
                $semana = $f->data->copy()->startOfWeek(Carbon::MONDAY)->toDateString();
                $total += $valor;
                $semanas[$semana] = ($semanas[$semana] ?? 0) + $valor;
            }
            if ($total > round((float) $contrato->meta_horas_tce * 100)) {
                $this->fail('meta_horas_tce', 'O teto é inferior às frequências já registradas.');
            }
            if ($semanas && max($semanas) > round((float) $contrato->carga_horaria_semanal * 100)) {
                $this->fail('carga_horaria_semanal', 'Existem semanas com frequência superior ao limite proposto.');
            }
        }
    }

    public function validarFrequencia(Estagio $estagio, string $data, float $horas, ?int $ignorar = null): void
    {
        if (! $estagio->meta_horas_tce || ! $estagio->carga_horaria_semanal) {
            $this->fail('estagio', 'Regularize os limites do TCE antes de registrar ou assinar frequências.');
        }
        $inicio = Carbon::parse($data)->startOfWeek(Carbon::MONDAY);
        $fim = $inicio->copy()->addDays(6);
        $query = $estagio->frequencias()->when($ignorar, fn ($q) => $q->where('id', '!=', $ignorar));
        $valor = (int) round($horas * 100);
        $total = (int) round((float) (clone $query)->sum('horas_diarias') * 100);
        $semana = (int) round((float) $query->whereBetween('data', [$inicio->toDateString(), $fim->toDateString()])->sum('horas_diarias') * 100);
        if ($total + $valor > round((float) $estagio->meta_horas_tce * 100)) {
            $this->fail('horas', 'A frequência excede o teto total do TCE.');
        }
        if ($semana + $valor > round((float) $estagio->carga_horaria_semanal * 100)) {
            $this->fail('horas', 'A frequência excede a carga semanal contratada.');
        }
    }
}

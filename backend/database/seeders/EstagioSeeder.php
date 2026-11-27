<?php

namespace Database\Seeders;

use App\Enums\StatusConvenio;
use App\Models\Aluno;
use App\Models\EmpresaConcedente;
use App\Models\Estagio;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class EstagioSeeder extends Seeder
{
    public function run(): void
    {
        if (! app()->environment(['local', 'testing'])) {
            return;
        }

        $empresa = EmpresaConcedente::firstOrCreate(['cnpj' => '12345678000190'], [
            'razao_social' => 'Empresa de demonstração',
            'endereco_completo' => 'Endereço de demonstração',
            'representante_legal' => 'Representante de demonstração',
            'status_convenio' => StatusConvenio::ATIVO,
        ]);

        DB::transaction(function () use ($empresa): void {
            $empresa = EmpresaConcedente::query()->lockForUpdate()->findOrFail($empresa->id);

            $alunos = Aluno::query()
                ->whereDoesntHave('estagios')
                ->whereHas('usuario', fn (Builder $query) => $query->where('status', 'ativo')->where('is_active', true))
                ->whereHas('turma', fn (Builder $query) => $query->where('status', 'ativa'))
                ->whereHas('turma.curso', fn (Builder $query) => $query->where('status', 'ativo'))
                ->get();

            if ($alunos->isEmpty() || ! $empresa->convenioAtivo()) {
                return;
            }

            $supervisor = $empresa->supervisores()->firstOrCreate(['email' => 'supervisor.estagio@sage.test'], [
                'nome' => 'Supervisor de demonstração',
                'cargo' => 'Supervisor de estágio',
                'formacao' => 'Administração',
                'telefone' => '00000000000',
            ]);

            foreach ($alunos as $aluno) {
                Estagio::factory()
                    ->for($aluno)
                    ->for($empresa, 'empresa')
                    ->for($supervisor, 'supervisor')
                    ->create();
            }
        }, 3);
    }
}

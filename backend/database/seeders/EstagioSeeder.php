<?php

namespace Database\Seeders;

use App\Models\Aluno;
use App\Models\EmpresaConcedente;
use App\Models\Estagio;
use App\Models\ProfessorOrientador;
use App\Models\SupervisorEmpresa;
use App\Models\User;
use App\Services\EstagioService;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class EstagioSeeder extends Seeder
{
    public function run(): void
    {
        if (! app()->environment(['local', 'testing'])) {
            return;
        }

        DB::transaction(function (): void {
            $empresa = EmpresaConcedente::where('cnpj', '12345678000190')->where('status_convenio', 'ATIVO')->first();
            $usuarioEmpresa = User::where('email', 'contato@techinovacoes.com.br')->where('role', 'empresa')->where('status', 'ativo')->first();
            $supervisor = SupervisorEmpresa::whereHas('empresa', fn ($q) => $q->where('status_convenio', 'ATIVO'))
                ->whereIn('usuario_id', User::where('role', 'empresa')->where('status', 'ativo')->select('id'))->orderBy('id')->first();

            // Os seeders existentes não cadastram supervisor. Vincula apenas as contas de demonstração conhecidas.
            if (! $supervisor && $empresa && $usuarioEmpresa) {
                $supervisor = SupervisorEmpresa::firstOrCreate([
                    'empresa_concedente_id' => $empresa->id,
                    'usuario_id' => $usuarioEmpresa->id,
                ], [
                    'nome' => $usuarioEmpresa->nome,
                    'cargo' => 'Supervisor de estágio',
                    'formacao' => 'Sistemas de Informação',
                    'telefone' => '38999990000',
                    'email' => $usuarioEmpresa->email,
                ]);
            }

            $orientadores = ProfessorOrientador::whereHas('usuario', fn ($q) => $q->where('status', 'ativo'))->orderBy('id')->get();
            if (! $supervisor || $orientadores->isEmpty()) {
                $this->command?->warn('Execute os seeders de usuários, empresa e orientadores antes de EstagioSeeder.');

                return;
            }

            $alunos = Aluno::whereHas('usuario', fn ($q) => $q->where('status', 'ativo'))
                ->whereHas('turma', fn ($q) => $q->where('status', 'ativa')->whereHas('curso', fn ($q) => $q->where('status', 'ativo')))
                ->orderBy('id')->limit(5)->get();

            foreach ($alunos as $indice => $aluno) {
                // Não cria outro contrato para um aluno já atendido, nem altera contratos existentes.
                if (Estagio::where('aluno_id', $aluno->id)->exists()) {
                    continue;
                }
                $orientador = $orientadores[$indice % $orientadores->count()];
                $dados = Estagio::factory()->raw([
                    'aluno_id' => $aluno->id,
                    'curso_id' => $aluno->turma->curso_id,
                    'supervisor_empresa_id' => $supervisor->id,
                    'empresa_concedente_id' => $supervisor->empresa_concedente_id,
                    'professor_orientador_id' => $orientador->id,
                ]);
                try {
                    $estagio = app(EstagioService::class)->criar($dados);
                } catch (ValidationException $e) {
                    $this->command?->warn("Aluno {$aluno->id}: {$e->getMessage()}");

                    continue;
                }
                $estagio->apolice()->create([
                    'numero_apolice' => "DEMO-ESTAGIO-{$estagio->id}",
                    'nome_seguradora' => 'Seguradora fictícia de demonstração',
                ]);
                $estagio->plano()->create([
                    'objetivos' => 'Praticar desenvolvimento de software sob orientação.',
                    'atividades_previstas' => 'Implementação, testes e documentação de funcionalidades.',
                    'cronograma' => 'Atividades semanais durante o período contratual.',
                ]);
            }
        });
    }
}

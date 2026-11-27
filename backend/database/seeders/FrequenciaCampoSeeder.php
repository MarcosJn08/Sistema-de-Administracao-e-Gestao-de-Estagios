<?php

namespace Database\Seeders;

use App\Enums\ModalidadeEstagio;
use App\Enums\StatusEstagio;
use App\Models\Aluno;
use App\Models\Curso;
use App\Models\EmpresaConcedente;
use App\Models\Estagio;
use App\Models\FrequenciaDiariaCampo;
use App\Models\ProfessorOrientador;
use App\Models\SupervisorEmpresa;
use App\Models\Turma;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class FrequenciaCampoSeeder extends Seeder
{
    public function run(): void
    {
        if (! app()->environment(['local', 'testing'])) {
            return;
        }

        DB::transaction(function (): void {
            $curso = Curso::firstOrCreate(
                ['codigo' => 'ENF'],
                [
                    'nome' => 'Técnico em Enfermagem',
                    'carga_horaria_estagio' => 400,
                    'horas_minimas_estagio' => 400,
                    'modalidade_estagio' => 'supervisionado_campo',
                    'status' => 'ativo',
                ]
            );

            $turma = Turma::firstOrCreate(
                ['nome' => 'ENF 2026.1', 'curso_id' => $curso->id],
                ['ano' => 2026, 'semestre' => 1, 'turno' => 'matutino', 'status' => 'ativa']
            );

            $professor = ProfessorOrientador::whereHas('usuario', fn ($q) => $q->where('status', 'ativo'))
                ->first();

            if (! $professor) {
                $this->command?->warn('Nenhum professor orientador encontrado. Execute ProfessorOrientadorSeeder antes.');
                return;
            }

            $empresaUser = User::where('role', 'empresa')->where('status', 'ativo')->first();
            $empresa = EmpresaConcedente::where('status_convenio', 'ATIVO')->first();

            if (! $empresa) {
                $empresa = EmpresaConcedente::create([
                    'razao_social' => 'Hospital Regional de Demonstração',
                    'cnpj' => '00000000000191',
                    'endereco_completo' => 'Av. Hospitalar, 500 – Montes Claros/MG',
                    'representante_legal' => 'Dr. Demo Silva',
                    'status_convenio' => 'ATIVO',
                ]);
            }

            $supervisor = SupervisorEmpresa::firstOrCreate(
                ['empresa_concedente_id' => $empresa->id, 'email' => 'ana.campo@hospital.demo.br'],
                [
                    'usuario_id' => $empresaUser?->id ?? User::where('role', 'empresa')->value('id'),
                    'nome' => 'Supervisora Ana Campo',
                    'cargo' => 'Enfermeira Supervisora',
                    'formacao' => 'Bacharelado em Enfermagem',
                    'telefone' => '38999110000',
                    'email' => 'ana.campo@hospital.demo.br',
                ]
            );

            $nomesAlunos = [
                ['nome' => 'Beatriz Almeida Santos', 'email' => 'beatriz.enf@aluno.ifnmg.edu.br', 'matricula' => 'ENF20261001', 'cpf' => '11111111101'],
                ['nome' => 'Carlos Eduardo Lima',    'email' => 'carlos.enf@aluno.ifnmg.edu.br',  'matricula' => 'ENF20261002', 'cpf' => '11111111102'],
                ['nome' => 'Diana Ferreira Costa',   'email' => 'diana.enf@aluno.ifnmg.edu.br',   'matricula' => 'ENF20261003', 'cpf' => '11111111103'],
                ['nome' => 'Fábio Souza Nogueira',   'email' => 'fabio.enf@aluno.ifnmg.edu.br',   'matricula' => 'ENF20261004', 'cpf' => '11111111104'],
            ];

            foreach ($nomesAlunos as $dados) {
                $user = User::firstOrCreate(
                    ['email' => $dados['email']],
                    [
                        'name' => $dados['nome'],
                        'role' => 'aluno',
                        'status' => 'ativo',
                        'password' => bcrypt('password123'),
                    ]
                );

                $aluno = Aluno::firstOrCreate(
                    ['usuario_id' => $user->id],
                    ['matricula' => $dados['matricula'], 'turma_id' => $turma->id, 'cpf' => $dados['cpf']]
                );

                if (Estagio::where('aluno_id', $aluno->id)->exists()) {
                    continue;
                }

                $estagio = Estagio::create([
                    'aluno_id' => $aluno->id,
                    'curso_id' => $curso->id,
                    'supervisor_empresa_id' => $supervisor->id,
                    'empresa_concedente_id' => $empresa->id,
                    'professor_orientador_id' => $professor->id,
                    'cargo' => 'Estagiário(a) em Enfermagem',
                    'modalidade' => ModalidadeEstagio::SUPERVISIONADO_CAMPO,
                    'data_inicio' => today()->subMonths(2)->toDateString(),
                    'data_termino' => today()->addMonths(4)->toDateString(),
                    'carga_horaria_diaria' => 6,
                    'carga_horaria_semanal' => 30,
                    'meta_horas_tce' => 400,
                    'bolsa_auxilio' => 0,
                    'status' => StatusEstagio::EM_ANDAMENTO,
                ]);

                $this->gerarFrequencias($estagio, $professor->id, $aluno->id);
            }
        });
    }

    private function gerarFrequencias(Estagio $estagio, int $professorId, int $alunoId): void
    {
        $data = today()->subWeeks(3)->startOfWeek();

        while ($data->lte(today()->subDay())) {
            if (! $data->isWeekend()) {
                $faltou = $data->dayOfWeek === 5;

                FrequenciaDiariaCampo::factory()
                    ->for($estagio)
                    ->naData($data->toDateString())
                    ->when($faltou, fn ($f) => $f->falta(), fn ($f) => $f->presente())
                    ->createQuietly([
                        'aluno_id'     => $alunoId,
                        'professor_id' => $professorId,
                    ]);
            }

            $data->addDay();
        }
    }
}

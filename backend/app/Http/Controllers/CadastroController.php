<?php

namespace App\Http\Controllers;

use App\Enums\StatusConvenio;
use App\Enums\UserRole;
use App\Models\Aluno;
use App\Models\Curso;
use App\Models\EmpresaConcedente;
use App\Models\ProfessorOrientador;
use App\Models\SupervisorEmpresa;
use App\Models\Turma;
use App\Models\Usuario;
use App\Rules\DocumentoFiscal;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules\Password;
use Illuminate\Validation\ValidationException;

class CadastroController extends Controller
{
    private const MODELS = ['usuarios' => Usuario::class, 'cursos' => Curso::class, 'turmas' => Turma::class, 'alunos' => Aluno::class, 'empresas' => EmpresaConcedente::class, 'professores' => ProfessorOrientador::class, 'supervisores' => SupervisorEmpresa::class];

    private function model(string $recurso): Model
    {
        abort_unless(isset(self::MODELS[$recurso]), 404);

        return new (self::MODELS[$recurso]);
    }

    private function rules(string $recurso, ?Model $record): array
    {
        $unique = fn (string $table, string $column) => Rule::unique($table, $column)->ignore($record?->getKey());
        $user = fn (string $perfil) => Rule::exists('usuarios', 'id')->where('perfil', $perfil)->where('status', 'ativo');

        return match ($recurso) {
            'usuarios' => ['nome' => 'required|string|max:255', 'email' => ['required', 'email', 'lowercase', 'max:255', $unique('usuarios', 'email')], 'password' => [$record ? 'sometimes' : 'required', 'string', 'max:255', Password::min(12)->letters()->numbers()], 'perfil' => ['required', Rule::enum(UserRole::class)], 'status' => ['sometimes', Rule::in(['ativo', 'inativo'])]],
            'cursos' => ['nome' => ['required', 'string', 'max:255', $unique('cursos', 'nome')], 'codigo' => ['nullable', 'string', 'max:20', $unique('cursos', 'codigo')], 'carga_horaria_estagio' => 'required|integer|min:1|max:10000', 'status' => ['sometimes', Rule::in(['ativo', 'inativo'])]],
            'turmas' => ['curso_id' => 'required|integer|exists:cursos,id', 'nome' => 'required|string|max:255', 'ano' => 'required|integer|min:2000|max:2200', 'semestre' => 'required|integer|in:1,2', 'turno' => 'nullable|in:matutino,vespertino,noturno', 'status' => 'sometimes|in:ativa,encerrada'],
            'alunos' => ['usuario_id' => ['required', 'integer', $user('ALUNO'), $unique('alunos', 'usuario_id')], 'turma_id' => 'required|integer|exists:turmas,id', 'matricula' => ['required', 'string', 'max:255', $unique('alunos', 'matricula')], 'cpf' => ['required', new DocumentoFiscal(11), $unique('alunos', 'cpf'), $this->uniqueFiscal('alunos', 'cpf', $record)], 'carga_horaria_cumprida' => 'prohibited'],
            'empresas' => ['cnpj' => ['required', new DocumentoFiscal(14), $unique('empresas_concedentes', 'cnpj'), $this->uniqueFiscal('empresas_concedentes', 'cnpj', $record)], 'razao_social' => 'required|string|max:255', 'endereco_completo' => 'required|string|max:255', 'representante_legal' => 'required|string|max:255', 'status_convenio' => ['sometimes', Rule::enum(StatusConvenio::class)]],
            'professores' => ['usuario_id' => ['required', 'integer', $user('PROFESSOR'), $unique('professores_orientadores', 'usuario_id')], 'siape_matricula' => ['required', 'string', 'max:255', $unique('professores_orientadores', 'siape_matricula')], 'departamento_area' => 'required|string|max:255', 'max_orientados' => 'required|integer|min:1|max:1000'],
            'supervisores' => ['empresa_concedente_id' => 'required|integer|exists:empresas_concedentes,id', 'usuario_id' => ['nullable', 'integer', $user('EMPRESA')], 'nome' => 'required|string|max:255', 'cargo' => 'required|string|max:255', 'formacao' => 'required|string|max:255', 'telefone' => 'required|string|max:20', 'email' => 'required|email|max:255'],
        };
    }

    private function normalizar(Request $request): void
    {
        foreach (['cpf', 'cnpj'] as $field) {
            if (is_string($request->input($field))) {
                $request->merge([$field => strtoupper(str_replace(['.', '-', '/', ' '], '', $request->input($field)))]);
            }
        }
    }

    private function uniqueFiscal(string $table, string $column, ?Model $record): \Closure
    {
        return function (string $attribute, mixed $value, \Closure $fail) use ($table, $column, $record): void {
            if (! is_string($value)) {
                return;
            }
            $query = DB::table($table)->whereRaw("UPPER(REPLACE(REPLACE(REPLACE({$column}, '.', ''), '/', ''), '-', '')) = ?", [$value]);
            if ($record) {
                $query->where('id', '!=', $record->getKey());
            }
            if ($query->exists()) {
                $fail('Este documento já está cadastrado.');
            }
        };
    }

    public function index(Request $request, string $recurso): JsonResponse
    {
        $data = $request->validate(['per_page' => 'sometimes|integer|min:1|max:100']);

        return $this->successResponse($this->model($recurso)->newQuery()->latest('id')->paginate($data['per_page'] ?? 20));
    }

    public function show(string $recurso, int $id): JsonResponse
    {
        return $this->successResponse($this->model($recurso)->newQuery()->findOrFail($id));
    }

    public function store(Request $request, string $recurso): JsonResponse
    {
        $model = $this->model($recurso);
        $this->normalizar($request);
        $data = $request->validate($this->rules($recurso, null));

        return $this->successResponse($model->newQuery()->create($data), 'Cadastro criado.', 201);
    }

    public function update(Request $request, string $recurso, int $id): JsonResponse
    {
        $model = $this->model($recurso)->newQuery()->findOrFail($id);
        $this->normalizar($request);
        $rules = $this->rules($recurso, $model);
        foreach ($rules as &$rule) {
            $rule = is_array($rule) ? array_merge(['sometimes'], $rule) : 'sometimes|'.$rule;
        }
        $data = $request->validate($rules);

        return DB::transaction(function () use ($request, $recurso, $model, $data) {
            $model = $model->newQuery()->whereKey($model->id)->lockForUpdate()->firstOrFail();
            if ($recurso === 'usuarios') {
                if (isset($data['perfil']) && $data['perfil'] !== $model->perfil->value) {
                    throw ValidationException::withMessages(['perfil' => 'O perfil de uma conta existente não pode ser alterado.']);
                }
                if ($model->id === $request->user()->id && ($data['status'] ?? 'ativo') !== 'ativo') {
                    throw ValidationException::withMessages(['status' => 'Você não pode desativar a própria conta.']);
                }
            }
            foreach (['usuario_id', 'empresa_concedente_id', 'turma_id', 'curso_id'] as $vinculo) {
                if (array_key_exists($vinculo, $data) && $model->$vinculo !== null && $data[$vinculo] != $model->$vinculo) {
                    throw ValidationException::withMessages([$vinculo => 'Vínculos de cadastros existentes são imutáveis.']);
                }
            }
            if ($recurso === 'professores' && isset($data['max_orientados']) && $data['max_orientados'] < $model->estagios()->where('status', 'EM_ANDAMENTO')->count()) {
                throw ValidationException::withMessages(['max_orientados' => 'O limite não pode ser menor que o número de estágios ativos.']);
            }
            $model->update($data);
            if ($recurso === 'usuarios' && (isset($data['password']) || ($data['status'] ?? null) === 'inativo')) {
                $model->tokens()->delete();
            }

            return $this->successResponse($model->refresh());
        });
    }
}

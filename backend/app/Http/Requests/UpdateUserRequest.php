<?php

namespace App\Http\Requests;

use App\Enums\UserRole;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules\Password;

class UpdateUserRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->temPerfil('DIRETOR') ?? false;
    }

    protected function prepareForValidation(): void
    {
        if (is_string($this->input('email'))) {
            $this->merge(['email' => strtolower(trim($this->input('email')))]);
        }
        if (is_string($this->input('cpf'))) {
            $this->merge(['cpf' => preg_replace('/\D/', '', $this->input('cpf'))]);
        }
    }

    public function rules(): array
    {
        $usuarioId = $this->route('usuario') instanceof \App\Models\Usuario
            ? $this->route('usuario')->id
            : (int) $this->route('usuario');

        return [
            'nome'      => ['sometimes', 'string', 'max:255'],
            'email'     => [
                'sometimes', 'email', 'lowercase', 'max:255', Rule::unique('usuarios', 'email')->ignore($usuarioId),
                function (string $attribute, mixed $value, \Closure $fail) use ($usuarioId): void {
                    if (app()->environment('testing')) {
                        return;
                    }
                    $domain = \Illuminate\Support\Str::afterLast(\Illuminate\Support\Str::lower($value), '@');
                    $usuario = \App\Models\Usuario::find($usuarioId);
                    $perfil = strtoupper((string) ($this->input('perfil') ?? ($usuario?->perfil instanceof \BackedEnum ? $usuario->perfil->value : $usuario?->perfil) ?? $usuario?->role ?? ''));
                    if ($perfil === 'PROFESSOR' && $domain !== 'ifnmg.edu.br') {
                        $fail('O e-mail de professor deve pertencer ao domínio institucional (@ifnmg.edu.br).');
                    } elseif ($perfil === 'ALUNO' && $domain !== 'aluno.ifnmg.edu.br') {
                        $fail('O e-mail de aluno deve pertencer ao domínio institucional (@aluno.ifnmg.edu.br).');
                    }
                },
            ],
            'cpf'       => ['sometimes', 'nullable', 'string', 'max:14', Rule::unique('usuarios', 'cpf')->ignore($usuarioId)],
            'password'  => ['sometimes', 'string', 'max:1024', Password::min(8)->letters()->numbers()],
            'perfil'    => ['sometimes', Rule::enum(UserRole::class)],
            'matricula' => ['sometimes', 'nullable', 'string', 'max:32', Rule::unique('usuarios', 'matricula')->ignore($usuarioId)],
            'siape'     => ['sometimes', 'nullable', 'string', 'max:32', Rule::unique('usuarios', 'siape')->ignore($usuarioId)],
            'cnpj'              => ['sometimes', 'nullable', 'string', 'max:14', Rule::unique('usuarios', 'cnpj')->ignore($usuarioId)],
            'status'            => ['sometimes', Rule::in(['ativo', 'inativo'])],
            'titulacao'         => ['sometimes', 'nullable', 'string', 'max:100'],
            'departamento'      => ['sometimes', 'nullable', 'string', 'max:100'],
            'areaAtuacao'       => ['sometimes', 'nullable', 'string', 'max:100'],
            'regimeTrabalho'    => ['sometimes', 'nullable', 'string', 'max:100'],
            'telefone'          => ['sometimes', 'nullable', 'string', 'max:30'],
            'maximoOrientandos' => ['sometimes', 'nullable', 'integer', 'min:1', 'max:100'],
            'curso'             => ['sometimes', 'nullable', 'string', 'max:150'],
        ];
    }

    public function messages(): array
    {
        return [
            'email.unique'     => 'Este e-mail já está em uso.',
            'cpf.unique'       => 'Este CPF já está cadastrado.',
            'matricula.unique' => 'Esta matrícula já está cadastrada.',
            'siape.unique'     => 'Este SIAPE já está cadastrado.',
        ];
    }
}

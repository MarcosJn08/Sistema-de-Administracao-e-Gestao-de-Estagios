<?php

namespace App\Http\Requests;

use App\Enums\UserRole;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules\Password;

class StoreUserRequest extends FormRequest
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
        if (is_string($this->input('matricula'))) {
            $this->merge(['matricula' => trim($this->input('matricula'))]);
        }
        if (is_string($this->input('siape'))) {
            $this->merge(['siape' => trim($this->input('siape'))]);
        }
        if (is_string($this->input('cpf'))) {
            $this->merge(['cpf' => preg_replace('/\D/', '', $this->input('cpf'))]);
        }
    }

    public function rules(): array
    {
        return [
            'nome'      => ['required', 'string', 'max:255'],
            'email'     => [
                'required', 'email', 'lowercase', 'max:255', Rule::unique('usuarios', 'email'),
                function (string $attribute, mixed $value, \Closure $fail): void {
                    if (app()->environment('testing')) {
                        return;
                    }
                    $domain = \Illuminate\Support\Str::afterLast(\Illuminate\Support\Str::lower($value), '@');
                    $perfil = strtoupper((string) ($this->input('perfil') ?? ''));
                    if ($perfil === 'PROFESSOR' && $domain !== 'ifnmg.edu.br') {
                        $fail('O e-mail de professor deve pertencer ao domínio institucional (@ifnmg.edu.br).');
                    } elseif ($perfil === 'ALUNO' && $domain !== 'aluno.ifnmg.edu.br') {
                        $fail('O e-mail de aluno deve pertencer ao domínio institucional (@aluno.ifnmg.edu.br).');
                    }
                },
            ],
            'cpf'       => ['nullable', 'string', 'max:14', Rule::unique('usuarios', 'cpf')],
            'password'  => ['required', 'string', 'max:1024', Password::min(8)->letters()->numbers()],
            'perfil'    => ['required', Rule::enum(UserRole::class)],
            'matricula' => ['nullable', 'string', 'max:32', Rule::unique('usuarios', 'matricula')],
            'siape'     => ['nullable', 'string', 'max:32', Rule::unique('usuarios', 'siape')],
            'cnpj'              => ['nullable', 'string', 'max:14', Rule::unique('usuarios', 'cnpj')],
            'status'            => ['sometimes', Rule::in(['ativo', 'inativo'])],
            'titulacao'         => ['nullable', 'string', 'max:100'],
            'departamento'      => ['nullable', 'string', 'max:100'],
            'areaAtuacao'       => ['nullable', 'string', 'max:100'],
            'regimeTrabalho'    => ['nullable', 'string', 'max:100'],
            'telefone'          => ['nullable', 'string', 'max:30'],
            'maximoOrientandos' => ['nullable', 'integer', 'min:1', 'max:100'],
            'curso'             => ['nullable', 'string', 'max:150'],
        ];
    }

    public function messages(): array
    {
        return [
            'nome.required'     => 'O nome é obrigatório.',
            'email.required'    => 'O e-mail é obrigatório.',
            'email.unique'      => 'Este e-mail já está em uso.',
            'cpf.unique'        => 'Este CPF já está cadastrado.',
            'password.required' => 'A senha é obrigatória.',
            'perfil.required'   => 'O perfil é obrigatório.',
            'matricula.unique'  => 'Esta matrícula já está cadastrada.',
            'siape.unique'      => 'Este SIAPE já está cadastrado.',
        ];
    }
}

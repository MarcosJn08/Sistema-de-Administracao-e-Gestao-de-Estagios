<?php

namespace App\Http\Requests;

use Closure;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Str;

class LoginRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    protected function prepareForValidation(): void
    {
        if ($this->has('email') && ! $this->has('identifier')) {
            $this->attributes->set('_legacy_email', true);
        }

        $identifier = $this->input('identifier') ?? $this->input('email');
        if (is_string($identifier)) {
            $this->merge(['identifier' => Str::lower(trim($identifier))]);
        }
    }

    public function rules(): array
    {
        return [
            'identifier' => [
                'bail', 'required', 'string', 'max:254',
                function (string $attribute, mixed $value, Closure $fail): void {
                    if (! filter_var($value, FILTER_VALIDATE_EMAIL)
                        && ! preg_match('/^\d{1,32}$/D', $value)
                        && ! preg_match('/^\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}$/D', $value)) {
                        $fail('Informe um e-mail, matrícula, SIAPE ou CNPJ válido.');
                    }
                },
            ],
            'password' => ['required', 'string', 'max:1024'],
            'role' => ['prohibited'],
        ];
    }

    public function messages(): array
    {
        return [
            'identifier.required' => 'Informe seu e-mail, matrícula, SIAPE ou CNPJ.',
            'identifier.string' => 'O identificador deve ser um texto.',
            'identifier.max' => 'O identificador deve ter no máximo 254 caracteres.',
            'password.required' => 'Informe sua senha.',
            'password.string' => 'A senha deve ser um texto.',
            'password.max' => 'A senha informada excede o tamanho permitido.',
            'role.prohibited' => 'O perfil é determinado pelo sistema.',
        ];
    }
}

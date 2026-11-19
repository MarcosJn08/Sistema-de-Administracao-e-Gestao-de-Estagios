<?php

namespace App\Http\Requests;

use Closure;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class ResetPasswordRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    protected function prepareForValidation(): void
    {
        $email = $this->input('email');

        if (is_string($email)) {
            $this->merge(['email' => strtolower(trim($email))]);
        }
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'email' => ['required', 'email:rfc', 'max:254', 'regex:/\A[^@\s]+@(?:aluno\.)?ifnmg\.edu\.br\z/i'],
            'token' => ['required', 'string', 'max:255'],
            'password' => [
                'required',
                'string',
                'min:8',
                'confirmed',
                'not_regex:/\x00/',
                function (string $attribute, mixed $value, Closure $fail): void {
                    if (is_string($value) && config('hashing.driver') === 'bcrypt' && strlen($value) > 72) {
                        $fail('A senha excede o tamanho aceito pelo sistema. Use uma senha mais curta.');
                    }
                },
            ],
            'password_confirmation' => ['required', 'string'],
        ];
    }

    public function messages(): array
    {
        return [
            'email.required' => 'Informe o e-mail institucional cadastrado.',
            'email.email' => 'Informe um e-mail válido.',
            'email.max' => 'O e-mail deve ter no máximo 254 caracteres.',
            'email.regex' => 'Use um e-mail @aluno.ifnmg.edu.br ou @ifnmg.edu.br.',
            'token.required' => 'O link de recuperação é inválido. Solicite um novo link.',
            'token.string' => 'O link de recuperação é inválido. Solicite um novo link.',
            'token.max' => 'O link de recuperação é inválido. Solicite um novo link.',
            'password.required' => 'Informe a nova senha.',
            'password.string' => 'A senha deve ser um texto.',
            'password.min' => 'Use uma senha com pelo menos 8 caracteres.',
            'password.confirmed' => 'A confirmação da senha não confere.',
            'password.not_regex' => 'A senha contém um caractere inválido.',
            'password_confirmation.required' => 'Confirme a nova senha.',
            'password_confirmation.string' => 'A confirmação da senha deve ser um texto.',
        ];
    }
}

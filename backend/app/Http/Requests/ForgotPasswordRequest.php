<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class ForgotPasswordRequest extends FormRequest
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
            'email' => ['required', 'email:rfc', 'max:254'],
        ];
    }

    public function messages(): array
    {
        return [
            'email.required' => 'Informe o e-mail cadastrado.',
            'email.email' => 'Informe um e-mail válido.',
            'email.max' => 'O e-mail deve ter no máximo 254 caracteres.',
        ];
    }
}

<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Facades\Gate;

class CancelarEstagioRequest extends FormRequest
{
    public const MINIMO_PARECER = 20;

    public const REGRAS_PARECER = ['required', 'string', 'min:'.self::MINIMO_PARECER, 'max:2000'];

    public function authorize(): bool
    {
        return Gate::allows('cancelarDesvioFuncao', $this->route('estagio'));
    }

    public function rules(): array
    {
        return ['justificativa_pedagogica' => self::REGRAS_PARECER];
    }

    public function messages(): array
    {
        return [
            'justificativa_pedagogica.required' => 'Informe o parecer pedagógico.',
            'justificativa_pedagogica.min' => 'O parecer pedagógico deve ter pelo menos :min caracteres.',
            'justificativa_pedagogica.max' => 'O parecer pedagógico deve ter até :max caracteres.',
        ];
    }
}

<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class RegistroFrequenciaCampoRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'data' => ['required', 'date_format:Y-m-d', 'before_or_equal:today'],
            'registros' => ['required', 'array', 'min:1'],
            'registros.*.aluno_id' => ['required', 'integer', 'exists:alunos,id'],
            'registros.*.estagio_id' => ['required', 'integer', 'exists:estagios,id'],
            'registros.*.presente' => ['required', 'boolean'],
            'registros.*.horas_cumpridas' => ['required', 'numeric', 'min:0', 'max:12'],
            'registros.*.observacoes' => ['nullable', 'string', 'max:1000'],
        ];
    }

    public function messages(): array
    {
        return [
            'data.required' => 'A data do registro de campo é obrigatória.',
            'data.date_format' => 'A data deve estar no formato Y-m-d.',
            'data.before_or_equal' => 'Não é permitido registrar frequências em datas futuras.',
            'registros.required' => 'Informe a lista de registros de frequência dos alunos.',
            'registros.*.horas_cumpridas.max' => 'A carga horária diária em campo não pode exceder 12 horas.',
        ];
    }
}

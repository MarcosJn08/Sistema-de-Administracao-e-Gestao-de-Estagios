<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreFrequenciaMensalRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'mes_competencia' => ['required', 'integer', 'between:1,12'],
            'ano_competencia' => ['required', 'integer', 'between:2020,2035'],
            'total_horas_mes' => ['required', 'numeric', 'min:0.5', 'max:220'],
            'arquivo' => ['required', 'file', 'mimes:pdf,jpg,jpeg,png', 'max:10240'],
        ];
    }

    public function messages(): array
    {
        return [
            'mes_competencia.required' => 'O mês de competência é obrigatório.',
            'mes_competencia.between' => 'O mês deve ser entre 1 e 12.',
            'ano_competencia.required' => 'O ano de competência é obrigatório.',
            'total_horas_mes.required' => 'Informe a quantidade total de horas do mês.',
            'total_horas_mes.min' => 'A quantidade mínima de horas é 0.5.',
            'arquivo.required' => 'O arquivo comprobatório da folha mensal é obrigatório.',
            'arquivo.mimes' => 'O comprovante deve ser um arquivo PDF ou imagem (JPG/PNG).',
        ];
    }
}

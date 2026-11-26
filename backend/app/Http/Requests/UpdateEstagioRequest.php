<?php

namespace App\Http\Requests;

class UpdateEstagioRequest extends StoreEstagioRequest
{
    public function authorize(): bool
    {
        return $this->user()?->can('update', $this->route('estagio')) ?? false;
    }

    public function rules(): array
    {
        $rules = parent::rules();
        foreach ($rules as $key => $rule) {
            $rules[$key] = is_array($rule) ? array_merge(['sometimes'], $rule) : 'sometimes|'.$rule;
        }
        foreach (['aluno_id', 'empresa_concedente_id', 'professor_orientador_id', 'curso_id', 'modalidade', 'status', 'encerrado_em', 'motivo_encerramento', 'termo_formalizado'] as $key) {
            $rules[$key] = 'prohibited';
        }
        $rules['data_termino'] = 'sometimes|required|date_format:Y-m-d';

        return $rules;
    }
}

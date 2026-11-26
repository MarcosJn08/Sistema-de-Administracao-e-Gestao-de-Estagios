<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class CursoRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $cursoId = $this->route('curso') instanceof \App\Models\Curso
            ? $this->route('curso')->id
            : $this->route('curso');

        $isPost = $this->isMethod('post');

        return [
            'nome' => [
                $isPost ? 'required' : 'sometimes',
                'string',
                'max:255',
                Rule::unique('cursos', 'nome')->ignore($cursoId),
            ],
            'codigo' => [
                'nullable',
                'string',
                'max:20',
                Rule::unique('cursos', 'codigo')->ignore($cursoId),
            ],
            'modalidade' => ['nullable', 'string', 'max:100'],
            'horas_minimas_estagio' => [
                $isPost && ! $this->has('carga_horaria_estagio') ? 'required' : 'sometimes',
                'integer',
                'min:1',
                'max:10000',
            ],
            'carga_horaria_estagio' => ['sometimes', 'integer', 'min:1', 'max:10000'],
            'permite_aproveitamento_projetos' => ['sometimes', 'boolean'],
            'modalidade_estagio' => ['sometimes', 'string', 'in:orientado,supervisionado_campo'],
            'status' => ['sometimes', 'string', 'in:ativo,inativo'],
        ];
    }
}

<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Facades\Gate;
use Illuminate\Validation\Rule;

class VincularOrientadorRequest extends FormRequest
{
    public function authorize(): bool
    {
        return Gate::allows('vincularOrientador', $this->route('estagio'));
    }

    public function rules(): array
    {
        return [
            'professor_orientador_id' => ['bail', 'required', 'integer', Rule::exists('professores_orientadores', 'id')],
        ];
    }
}

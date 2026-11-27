<?php

namespace App\Http\Requests;

use App\Enums\ModalidadeEstagio;
use App\Models\Estagio;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreEstagioRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->can('create', Estagio::class) ?? false;
    }

    public function rules(): array
    {
        return [
            'aluno_id' => 'required|integer|exists:alunos,id',
            'empresa_concedente_id' => 'required|integer|exists:empresas_concedentes,id',
            'supervisor_empresa_id' => 'required|integer|exists:supervisores_empresa,id',
            'professor_orientador_id' => 'required|integer|exists:professores_orientadores,id',
            'cargo' => 'required|string|max:255',
            'data_inicio' => 'required|date_format:Y-m-d',
            'data_termino' => 'required|date_format:Y-m-d|after_or_equal:data_inicio',
            'carga_horaria_diaria' => 'required|numeric|gt:0|max:24|decimal:0,2',
            'carga_horaria_semanal' => 'required|numeric|gt:0|max:30|decimal:0,2',
            'meta_horas_tce' => 'required|numeric|gt:0|max:999999.99|decimal:0,2',
            'bolsa_auxilio' => 'nullable|numeric|min:0|max:99999999.99|decimal:0,2',
            'modalidade' => ['required', Rule::enum(ModalidadeEstagio::class)],
            'termo_formalizado' => 'required|file|mimes:pdf|max:10240',
            'status' => 'prohibited', 'curso_id' => 'prohibited',
        ];
    }
}

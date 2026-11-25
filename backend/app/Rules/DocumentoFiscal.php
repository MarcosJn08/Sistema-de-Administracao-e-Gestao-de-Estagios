<?php

namespace App\Rules;

use Closure;
use Illuminate\Contracts\Validation\ValidationRule;

class DocumentoFiscal implements ValidationRule
{
    public function __construct(private readonly int $length) {}

    public function validate(string $attribute, mixed $value, Closure $fail): void
    {
        $pattern = $this->length === 11 ? '/^[0-9]{11}$/' : '/^[A-Z0-9]{12}[0-9]{2}$/';
        if (! is_string($value) || ! preg_match($pattern, $value) || preg_match('/^(.)\1+$/', $value)) {
            $fail('Informe um documento válido, sem máscara e com letras maiúsculas quando aplicável.');

            return;
        }
        $base = substr($value, 0, -2);
        for ($digit = 0; $digit < 2; $digit++) {
            $weights = $this->length === 11 ? range(strlen($base) + 1, 2) : ($digit === 0 ? [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2] : [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]);
            $sum = 0;
            foreach ($weights as $i => $weight) {
                $sum += (ord($base[$i]) - 48) * $weight;
            }
            $remainder = $sum % 11;
            $base .= $remainder < 2 ? '0' : (string) (11 - $remainder);
        }
        if ($base !== $value) {
            $fail('O documento possui dígitos verificadores inválidos.');
        }
    }
}

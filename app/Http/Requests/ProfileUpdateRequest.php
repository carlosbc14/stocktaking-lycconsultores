<?php

namespace App\Http\Requests;

use App\Models\User;
use Freshwork\ChileanBundle\Rut;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class ProfileUpdateRequest extends FormRequest
{
    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\Rule|array|string>
     */
    public function rules(): array
    {
        return [
            'rut' => ['required', 'cl_rut', 'max:255', Rule::unique(User::class)->ignore($this->user()->id)],
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'lowercase', 'email', 'max:255', Rule::unique(User::class)->ignore($this->user()->id)],
        ];
    }

    protected function prepareForValidation()
    {
        $this->merge([
            'rut' => Rut::parse($this->rut)->quiet()->format(),
        ]);
    }
}

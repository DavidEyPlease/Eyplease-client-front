import { object, string } from 'zod'

export const SignInSchema = object({
    username: string('El usuario debe ser válido').min(2, 'El usuario debe tener al menos 2 caracteres').max(100, 'El usuario debe tener como máximo 100 caracteres'),
    password: string('La contraseña debe ser válida').min(6, 'La contraseña debe tener al menos 6 caracteres').max(100, 'La contraseña debe tener como máximo 100 caracteres')
})
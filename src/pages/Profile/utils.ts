import { z } from "zod"

/** Fuerza de la nueva contraseña (0-4): solo orientativa, la validación real es el schema. */
export const getPasswordStrength = (password: string): number => {
    if (!password) return 0

    let score = 0
    if (password.length >= 8) score++
    if (password.length >= 12) score++
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score++
    if (/\d/.test(password)) score++
    if (/[^a-zA-Z0-9]/.test(password)) score++

    return Math.min(score, 4)
}

export const PASSWORD_STRENGTH_LABELS = ['Muy débil', 'Débil', 'Aceptable', 'Buena', 'Excelente']

export const EditProfileSchema = z.object({
    name: z
        .string({ error: 'El usuario debe ser válido' })
        .min(1, 'Ingresa el usuario/cuenta'),
    email: z
        .email('El correo electrónico debe ser válido')
        .min(1, 'Ingresa el correo electrónico')
        .max(30, 'El correo electrónico debe tener menos de 30 caracteres'),
    phone: z
        .string()
        .min(1, 'Ingresa el número de teléfono')
        .nullable(),
})


export const ChangePasswordSchema = z
    .object({
        currentPassword: z
            .string({ error: 'El usuario debe ser válido' })
            .min(1, 'Ingresa el usuario/cuenta'),
        newPassword: z
            .string({ error: 'La contraseña debe ser válida' })
            .min(1, 'Ingresa la contraseña')
            .min(8, 'La contraseña debe tener al menos 8 caracteres'),
        confirmPassword: z
            .string({ error: 'La contraseña debe ser válida' })
            .min(1, 'Ingresa la contraseña')
            .min(8, 'La contraseña debe tener al menos 8 caracteres'),
    })
    .refine(
        (data) => data.newPassword === data.confirmPassword,
        {
            path: ['confirmPassword'],
            message: 'Las contraseñas no coinciden',
        }
    )
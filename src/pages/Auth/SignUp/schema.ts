import { z } from 'zod'
import type { UnitSize, DirectorYears, PlanId, UserType as UserTypeFromPlans } from '@/constants/plans'

export type UserType = UserTypeFromPlans
export type MKConnectMode = 'auto' | 'manual'

export const SignUpSchema = z.object({
    fullName: z
        .string({ message: 'Ingresa tu nombre completo' })
        .trim()
        .min(2, 'Mínimo 2 caracteres'),
    email: z
        .string({ message: 'Ingresa tu correo' })
        .trim()
        .min(1, 'Ingresa tu correo')
        .email('El correo electrónico ingresado es inválido'),
    countryCode: z.string().min(1, 'Selecciona un país'),
    phoneNumber: z
        .string({ message: 'Ingresa tu WhatsApp' })
        .trim()
        .min(1, 'Ingresa tu WhatsApp')
        .regex(/^[0-9]+$/, 'Solo dígitos')
        .min(8, 'Mínimo 8 dígitos'),
    password: z
        .string({ message: 'Ingresa una contraseña' })
        .min(8, 'Mínimo 8 caracteres'),
    userType: z.enum(['directora', 'consultora', 'otro'], { message: 'Selecciona tu perfil' }),
    unitSize: z.enum(['pequena', 'mediana', 'grande']).optional(),
    directorYears: z.enum(['lt1', '1-3', '3-5', 'gt5']).optional(),
    recommendedPlan: z.enum(['free', 'standard', 'basico', 'ejecutivo', 'elite', 'nacional']).optional(),
    mkConnectMode: z.enum(['auto', 'manual']).optional(),
    mkUserId: z.string().optional(),
    mkPassword: z.string().optional(),
    otherContext: z.string().optional(),
    acceptTerms: z.literal(true, { message: 'Acepta los términos para continuar' }),
})

export type ISignUp = z.infer<typeof SignUpSchema>

// Re-exports para que los steps no tengan que importar de @/constants/plans
export type { UnitSize, DirectorYears, PlanId }

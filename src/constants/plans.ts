import { PlanKeys } from "@/interfaces/plans"

export type UserType = 'director' | 'consultant' | 'other'
export type UnitSize = 'small' | 'medium' | 'large'
export type DirectorYears = 'lt1' | '1-3' | '3-5' | 'gt5'

export const TRIAL_DAYS = 14

export const PLANS_METADATA: Record<PlanKeys, { audience: string; headline: string, recommendedTagline?: string }> = {
    [PlanKeys.FREE]: {
        audience: 'Todas',
        headline: 'Para empezar a probar Eyplease+',
    },
    [PlanKeys.STANDARD]: {
        audience: 'Consultoras',
        headline: 'El plan diseñado para Consultoras que venden a sus clientas finales',
    },
    [PlanKeys.BASIC]: {
        audience: 'Directoras',
        headline: 'Lo esencial para liderar tu unidad sin pasar la tarde en boletines',
    },
    [PlanKeys.EXECUTIVE]: {
        audience: 'Directoras',
        headline: 'El balance perfecto: liderazgo, entrenamiento y servicios con IA',
        recommendedTagline: 'El más elegido por Directoras',
    },
    [PlanKeys.ELITE]: {
        audience: 'Directoras',
        headline: 'Para Directoras con unidades grandes que necesitan todo el potencial',
    },
    [PlanKeys.NATIONAL]: {
        audience: 'Directoras',
        headline: 'Para Directoras Nacionales que coordinan varias unidades',
    },
}


/**
 * Recomienda un plan según el perfil del usuario.
 * Default = Ejecutivo (preferencia comercial).
 *
 * Consultora → Estándar.
 * Directora grande con +5 años → Elite.
 * Resto de Directoras (y "otro" fallback) → Ejecutivo.
 */
export const recommendPlan = (
    userType: UserType,
    unitSize?: UnitSize,
    years?: DirectorYears
): PlanKeys => {
    if (userType === 'consultant') return PlanKeys.STANDARD
    if (unitSize === 'large' && years === 'gt5') return PlanKeys.ELITE
    return PlanKeys.EXECUTIVE
}

export const UNIT_SIZE_OPTIONS: { value: UnitSize; label: string; desc: string }[] = [
    { value: 'small', label: 'Pequeña', desc: 'Hasta 15 consultoras activas' },
    { value: 'medium', label: 'Mediana', desc: 'Entre 16 y 50 consultoras' },
    { value: 'large', label: 'Grande', desc: 'Más de 50 consultoras' },
]

export const DIRECTOR_YEARS_OPTIONS: { value: DirectorYears; label: string }[] = [
    { value: 'lt1', label: 'Menos de 1 año' },
    { value: '1-3', label: 'Entre 1 y 3 años' },
    { value: '3-5', label: 'Entre 3 y 5 años' },
    { value: 'gt5', label: 'Más de 5 años' },
]

export type PlanId = 'free' | 'standard' | 'basico' | 'ejecutivo' | 'elite' | 'nacional'
export type UserType = 'directora' | 'consultora' | 'otro'
export type UnitSize = 'pequena' | 'mediana' | 'grande'
export type DirectorYears = 'lt1' | '1-3' | '3-5' | 'gt5'

export interface Plan {
    id: PlanId
    name: string
    audience: 'Consultoras' | 'Directoras' | 'Todas'
    monthlyPrice: number
    currency: 'MXN'
    headline: string
    highlights: string[]
    recommendedTagline?: string
}

export const PLANS: Record<PlanId, Plan> = {
    free: {
        id: 'free',
        name: 'Gratis',
        audience: 'Todas',
        monthlyPrice: 0,
        currency: 'MXN',
        headline: 'Para empezar a probar Eyplease+',
        highlights: [
            'Acceso limitado a boletines',
            'Vista previa de materiales',
            'Sin reportes ni entrenamientos',
        ],
    },
    standard: {
        id: 'standard',
        name: 'Estándar',
        audience: 'Consultoras',
        monthlyPrice: 99,
        currency: 'MXN',
        headline: 'El plan diseñado para Consultoras que venden a sus clientas finales',
        highlights: [
            'Boletines automáticos para tus clientas',
            'Reconocimientos personalizados',
            'Biblioteca de materiales de venta',
            'Soporte por WhatsApp',
        ],
    },
    basico: {
        id: 'basico',
        name: 'Básico',
        audience: 'Directoras',
        monthlyPrice: 349,
        currency: 'MXN',
        headline: 'Lo esencial para liderar tu unidad sin pasar la tarde en boletines',
        highlights: [
            'Boletines mensuales automáticos',
            'Reconocimientos individualizados (8 categorías)',
            'Biblioteca de materiales',
            'Reportes de tu unidad',
        ],
    },
    ejecutivo: {
        id: 'ejecutivo',
        name: 'Ejecutivo',
        audience: 'Directoras',
        monthlyPrice: 659,
        currency: 'MXN',
        headline: 'El balance perfecto: liderazgo, entrenamiento y servicios con IA',
        highlights: [
            'Todo lo del plan Básico',
            'Entrenamientos en video para tu equipo',
            'Servicios personalizados con IA (Gemini)',
            'Calendario de contenido planificado',
        ],
        recommendedTagline: 'El más elegido por Directoras',
    },
    elite: {
        id: 'elite',
        name: 'Elite',
        audience: 'Directoras',
        monthlyPrice: 969,
        currency: 'MXN',
        headline: 'Para Directoras con unidades grandes que necesitan todo el potencial',
        highlights: [
            'Todo lo del plan Ejecutivo',
            'Eventos virtuales con tu unidad',
            'Branding completo con tu identidad',
            'Soporte prioritario',
        ],
    },
    nacional: {
        id: 'nacional',
        name: 'Nacional',
        audience: 'Directoras',
        monthlyPrice: 1099,
        currency: 'MXN',
        headline: 'Para Directoras Nacionales que coordinan varias unidades',
        highlights: [
            'Todo lo del plan Elite',
            'Vista multi-unidad',
            'Acceso anticipado a nuevas funciones',
            'Estratega dedicado',
        ],
    },
}

export const TRIAL_DAYS = 14

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
): PlanId => {
    if (userType === 'consultora') return 'standard'
    if (unitSize === 'grande' && years === 'gt5') return 'elite'
    return 'ejecutivo'
}

export const UNIT_SIZE_OPTIONS: { value: UnitSize; label: string; desc: string }[] = [
    { value: 'pequena', label: 'Pequeña', desc: 'Hasta 15 consultoras activas' },
    { value: 'mediana', label: 'Mediana', desc: 'Entre 16 y 50 consultoras' },
    { value: 'grande', label: 'Grande', desc: 'Más de 50 consultoras' },
]

export const DIRECTOR_YEARS_OPTIONS: { value: DirectorYears; label: string }[] = [
    { value: 'lt1', label: 'Menos de 1 año' },
    { value: '1-3', label: 'Entre 1 y 3 años' },
    { value: '3-5', label: 'Entre 3 y 5 años' },
    { value: 'gt5', label: 'Más de 5 años' },
]

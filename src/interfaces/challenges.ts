export type ChallengeScope = 'personal' | 'unit'
export type ChallengeType = 'coverage' | 'section_share' | 'leaders_five' | 'unit_points' | 'unit_hearts'

export interface ChallengePerson {
    id: string
    name: string
    account: string | null
    photo: { url: string, has_photo: boolean } | null
}

export interface ChallengeRow extends ChallengePerson {
    current: number
    goal: number
    done: boolean
    awarded: boolean
}

export interface ChallengeProgress {
    current: number
    goal: number
    /** En qué se cuenta el avance: porcentaje de la unidad, personas que llegaron o piezas enviadas */
    measure: 'percent' | 'people' | 'pieces'
    done: boolean
    detail: string | null
    /** El reporte del que sale el avance no se ha cargado este mes */
    data_missing: boolean
}

export interface IChallenge {
    id: string
    scope: ChallengeScope
    type: ChallengeType
    title: string
    description: string | null
    target: number
    prize: string | null
    /** YYYY-MM */
    period: string
    /** YYYY-MM-DD */
    ends_on: string
    /** Puesto para el mes siguiente (p. ej. desde el Asistente): todavía no empieza a contar */
    is_upcoming?: boolean
    /** YYYY-MM-DD: el día 1 de su mes */
    starts_on?: string
    /** Retos a la unidad: el pedido de diseño con su pieza, que entra solo al ponerlo (lo fabrica el estudio) */
    piece?: { service_id: string, status: string | null, status_name: string | null } | null
    /** Cuántas ganadoras ya tienen su pieza (Elite y Nacional: llegan solas al llegar a la meta) */
    celebrated_count?: number
    is_open: boolean
    awards_count: number
    progress: ChallengeProgress
    /** Sólo en el detalle */
    rows?: ChallengeRow[]
}

export interface ChallengeList {
    personal: IChallenge[]
    unit: IChallenge[]
}

export interface ChallengeSuggestion {
    type: ChallengeType
    title: string
    description: string
    target: number
    params: Record<string, string> | null
    people: Array<ChallengePerson & { actives: number }>
}

export interface NewChallenge {
    type: ChallengeType
    target?: number
    prize?: string
    title?: string
    ends_on?: string
    params?: Record<string, string> | null
}

/** Los cuatro números de arriba de Indicadores. `null` = el reporte de donde sale no se ha cargado. */
export interface BusinessIndicators {
    month: string
    unit_size: number
    leaders: { count: number, period: string | null, people: Array<ChallengePerson & { actives: number }> }
    ordered: { count: number | null, total: number, source: 'sales' | 'hearts' | null }
    with_hearts: { count: number | null }
    near_gift: { count: number | null }
}

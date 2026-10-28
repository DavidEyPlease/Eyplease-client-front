import { InventorySummary } from './inventory'

/**
 * «Tu estrategia» (plan Standard de consultora), parte 3: la estrategia del mes, armada con su inventario, su nivel de
 * descuento y sus ventas. `GET consultant/strategy` (API 98f96df). Precios CON IVA; lo del nivel, SIN IVA (como cuenta
 * Mary Kay la Sección 1). Todo sale de reglas en la API, sin IA.
 */

/** empty: no tiene inventario · start: va empezando · medium · big: compró mucho */
export type StrategySegment = 'empty' | 'start' | 'medium' | 'big'

export interface StrategyLevel {
    /** AAAA-MM */
    month: string
    /** Lo que lleva en Sección 1 este mes, a menudeo SIN IVA */
    accumulated: number
    /** El nivel que ya ganó este mes (35, 40, 45, 50… o 0) */
    earned: number
    /** El que conserva del mes pasado (BOOST) */
    kept: number
    kept_from: number | null
    /** Con el que compra: el mayor de los dos */
    level: number
    next: { level: number, from: number, missing: number } | null
    /** Lo que gane este mes lo conserva el que entra */
    keeps_next_month: boolean
}

export interface StrategyMoment {
    key: string
    label: string
    from: string
    to: string
    /** «del 13 al 17 de noviembre» */
    dates: string
    active: boolean
}

export interface StrategyStep {
    text: string
    /** La pieza que acompaña el paso */
    piece: 'ahora' | 'duo' | null
}

export interface StrategyProduct {
    sku: string
    name: string
    shade: string | null
    price: number
    on_hand: number
    category: string
}

/** Una lámina de la biblioteca de Astra con el logo de ella (JPEG 1080×1920). La imagen PIDE SESIÓN: se baja con la API. */
export interface StrategySlide {
    key: string
    url: string
}

export interface StrategyPiece {
    /** ahora: entrega inmediata · duo: el dúo del momento · regalo: Navidad · tambien: otro disponible */
    key: 'ahora' | 'duo' | 'regalo' | 'tambien'
    tag: string
    title: string
    products: StrategyProduct[]
    normal_price: number
    /** Promoción sugerida (ella la cambia); nula = a precio normal */
    promo_price: number | null
    /** Lo que gana con el precio sugerido; nulo si algún producto no tiene factura */
    profit: number | null
    /** El texto para WhatsApp */
    message: string
    /** Sus láminas en orden (el dúo: portada del momento + cada producto). Vacío = aún sin imagen: boceto y sólo el mensaje */
    slides?: StrategySlide[]
}

export interface StrategyReminder {
    client_customer_id: string | null
    customer_name: string
    product: string
    sold_at: string
    weeks: number
    message: string
}

export interface ConsultantStrategy {
    /** «octubre» */
    month: string
    segment: StrategySegment
    headline: string
    focus: { key: string, label: string } | null
    diagnosis: string
    level: StrategyLevel
    moment: StrategyMoment | null
    plan: StrategyStep[]
    pieces: StrategyPiece[]
    reminders: StrategyReminder[]
    inventory: { summary: InventorySummary, reviewed: boolean, last_order: { number: string, date: string } | null }
}

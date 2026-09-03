export enum PaymentStatus {
    PAID = 'paid',
    /** Comprobante subido, esperando que el administrador lo valide. */
    IN_REVIEW = 'in_review',
    PARTIAL = 'partial',
    OVERDUE = 'overdue',
    PENDING = 'pending',
}

export enum PaymentMethod {
    STRIPE = 'stripe',
    TRANSFER = 'transfer',
    CARD = 'card',
    CASH = 'cash',
}

/** Automático (tarjeta vía Stripe) o manual (transferencia/efectivo). */
export type BillingType = 'stripe' | 'manual'

export interface IPaymentAccount {
    bank: string
    beneficiary: string
    number: string
    numberType: string | null
}

interface IAutomaticPaymentMethod {
    type: 'automatic'
    card: { brand: string | null, last_four: string } | null
    /** Sin tarjeta espejada no hay con qué cobrar: toca actualizarla. */
    needs_card: boolean
}

interface IManualPaymentMethod {
    type: 'manual'
    accounts: IPaymentAccount[]
    instructions: string | null
}

export type IBillingPaymentMethod = IAutomaticPaymentMethod | IManualPaymentMethod

/** Funciones que la escalada por atraso puede cerrar. Mismas claves que el backend. */
export enum BillingRestrictedFeature {
    BIRTHDAY_POSTS = 'birthday_posts',
    LIBRARY_PROPOSALS = 'library_proposals',
}

/** Por qué la escalada está en pausa aunque haya atraso. */
export type BillingPausedReason = 'in_review' | 'grace'

/**
 * Escalada por atraso, ya resuelta por la API: qué mostrar, qué cerrar y cuánto
 * falta para el bloqueo. El front no conoce ningún umbral.
 */
export interface IBillingEnforcement {
    days_overdue: number
    show_reminder_popup: boolean
    show_home_banner: boolean
    show_global_banner: boolean
    restricted_features: BillingRestrictedFeature[]
    days_until_block: number | null
    block_date: string | null
    account_blocked: boolean
    paused_reason: BillingPausedReason | null
}

/** Lo que viaja en el evento del navegador cuando la API responde 403 por atraso. */
export interface IBillingRestrictedEvent {
    code: string
    feature?: BillingRestrictedFeature
}

/** El periodo que toca atender ahora: ya resuelto por la API, sin reglas en el front. */
export interface ICurrentPayment {
    period: string
    status: PaymentStatus
    amount: number
    remaining: number
    currency: string
    due_date: string | null
    is_due: boolean
    is_overdue: boolean
    has_receipt: boolean
    can_upload_receipt: boolean
    enforcement: IBillingEnforcement
}

export interface IBillingOverview {
    billing_type: BillingType
    plan: { name: string, price: number } | null
    next_amount: number
    currency: string
    next_charge_date: string | null
    payment_day: number | null
    balance: number
    oldest_unpaid_period: string | null
    unpaid_periods: number
    payment_method: IBillingPaymentMethod
    current_payment: ICurrentPayment | null
    /** Años con movimientos, del más reciente al más antiguo. */
    payment_years: number[]
}

export interface IBillingPayment {
    id: string
    period: string
    amount: number
    paid: number
    remaining: number
    currency: string
    status: PaymentStatus
    method: PaymentMethod | null
    paid_at: string | null
    reference_number: string | null
    receipt_uploaded_at: string | null
    has_receipt: boolean
    receipt_url: string | null
    can_upload_receipt: boolean
}

export interface IUploadReceiptPayload {
    receipt_uri: string
    reference_number?: string
    method?: PaymentMethod.TRANSFER | PaymentMethod.CASH
}

/** «Invitar con regalo» (API: UnitInvitationService). */

/** Cómo va cada consultora: falta invitarla, ya se la mandó, abrió su liga, activó, o ya usaba Eyplease+ por su cuenta */
export type InvitationStatus = 'sin_invitar' | 'invitada' | 'abrio' | 'activo' | 'ya_usa'

export interface UnitInvitation {
    id: string
    url: string
    status: 'sin_enviar' | 'invitada' | 'abrio' | 'activo'
    sent_at: string | null
    last_sent_at: string | null
    times_sent: number
    opened_at: string | null
    times_opened: number
    activated_at: string | null
    gift_applied: boolean
    gift_ends_at: string | null
    reminded_at: string | null
    times_reminded: number
}

export interface InvitationPerson {
    id: string
    name: string
    first_name: string
    account: string
    country: string | null
    phone: string | null
    /** Con lada, listo para wa.me; null si no tenemos su número */
    whatsapp: string | null
    photo: string | null
}

export interface UnitInvitationRow extends InvitationPerson {
    /** Ya tiene pedidos: su estrategia ya está armada (se invita primero) */
    has_orders: boolean
    has_account: boolean
    plan: string | null
    status: InvitationStatus
    invitation: UnitInvitation | null
}

export interface GiftInfo {
    months: number
    name: string
    value: number
    currency: string
}

export interface UnitInvitationsResponse {
    available: boolean
    reason: string | null
    message: string | null
    gift: GiftInfo
    totals: {
        unit: number
        with_app: number
        to_invite: number
        invited: number
        opened: number
        activated: number
        gifts: number
    }
    next_person_id: string | null
    people: UnitInvitationRow[]
}

/** Lo que necesita la Directora para mandarla (POST unit/invitations y …/sent) */
export interface InvitationShare extends UnitInvitation {
    list_status: InvitationStatus
    person: InvitationPerson & { has_orders: boolean }
    image_url: string
    image_name: string
    messages: { invite: string, reminder: string }
    /** El que toca ahora: la invitación o, si ya se la mandó, el recordatorio */
    message: string
    whatsapp_url: string | null
}

/** La página del regalo (GET gifts/{token}, sin sesión) */
export interface GiftView {
    status: 'open' | 'has_account' | 'activated'
    /** Quien la abre ya es ella, con su sesión: lo activa sin registrarse */
    is_mine: boolean
    consultant: { first_name: string, given_names: string }
    director: { name: string, first_name: string, initials: string, photo: string | null }
    gift: GiftInfo & {
        available: boolean
        reason: string | null
        message: string | null
        ends_at: string | null
        ends_label: string | null
    }
    preview: GiftPreview | null
    signup: { name: string, username: string, country: string, director_name: string } | null
}

/** Su estrategia del mes SIN montos: se enseña borrosa hasta que lo active */
export interface GiftPreview {
    month: string
    ready: boolean
    headline: string | null
    focus: string | null
    products: number
    last_order: string | null
    moment: { label: string, dates: string } | null
    pieces: Array<{
        key: string
        tag: string
        title: string
        products: string[]
        image_key: string | null
        image_url: string | null
    }>
}

export interface GiftClaim {
    applied: boolean
    message: string | null
    ends_at: string | null
    ends_label: string | null
}

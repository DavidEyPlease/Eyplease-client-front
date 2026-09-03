import { APP_ROUTES } from '@/constants/app'
import { BillingRestrictedFeature, IBillingEnforcement } from '@/interfaces/billing'

/** Lo que devuelve la API cuando no hay nada que escalar. También sirve de valor por defecto. */
export const NO_ENFORCEMENT: IBillingEnforcement = {
    days_overdue: 0,
    show_reminder_popup: false,
    show_home_banner: false,
    show_global_banner: false,
    restricted_features: [],
    days_until_block: null,
    block_date: null,
    account_blocked: false,
    paused_reason: null,
}

/** Cómo se llama cada función cerrada cuando se le explica a la clienta. */
export const RESTRICTED_FEATURE_LABELS: Record<BillingRestrictedFeature, string> = {
    [BillingRestrictedFeature.BIRTHDAY_POSTS]: 'las publicaciones de cumpleaños',
    [BillingRestrictedFeature.LIBRARY_PROPOSALS]: 'las propuestas de la biblioteca',
}

/** La ficha de facturación del perfil, a la que llevan todos los avisos. */
export const PROFILE_BILLING_PATH = `${APP_ROUTES.HOME.PROFILE}?section=billing`

const REMINDER_STORAGE_PREFIX = 'billing:reminder'

const todayKey = () => new Date().toISOString().slice(0, 10)

/**
 * El recordatorio se muestra una vez al día por periodo. Se recuerda en el
 * navegador: reabrir la pestaña no debe volver a interrumpir.
 */
export const wasReminderShownToday = (period: string): boolean => {
    try {
        return localStorage.getItem(`${REMINDER_STORAGE_PREFIX}:${period}`) === todayKey()
    } catch {
        return false
    }
}

export const markReminderShown = (period: string) => {
    try {
        localStorage.setItem(`${REMINDER_STORAGE_PREFIX}:${period}`, todayKey())
    } catch {
        /* Sin storage (modo privado) simplemente se vuelve a mostrar */
    }
}

export const daysLabel = (days: number) => `${days} ${days === 1 ? 'día' : 'días'}`

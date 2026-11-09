import { IPermission } from "./permissions"

export interface IPlan {
    id: string
    name: string
    /** free, standard, basic, executive, elite, national… */
    plan_key?: string
    /** unit (Directora) o clients (consultora) */
    audience?: string | null
    price: number
    features: string[]
    accesses: IPermission[]
    best_sell?: boolean
    /** Días de prueba gratis al registrarse (0: se contrata pagando) */
    trial_days?: number | null
    /** La oferta de entrada al registrarse, en lugar de la prueba (el Standard desde su lanzamiento: 3 meses a $99; en el
     * Buen Fin, el Standard 6 meses a $99 y Elite y Área 6 meses a $659) */
    offer?: IPlanOffer | null
    /** La promoción que dejó por quedarse con su mes gratis (`?prefer_trial=1`, Elite y Área en el Buen Fin), para poder
     * regresar a ella. Sólo viene cuando la escogió así */
    declined_offer?: IPlanOffer | null
    /** Lo que paga si se queda al terminar su mes gratis (el Standard desde el 9-nov-2026: entra con su prueba y, si lo
     * contrata, su oferta; la del Buen Fin si se registra en esas fechas) */
    after_trial_offer?: IPlanOffer | null
}

export interface IPlanOffer {
    months: number
    amount: number
    /** El nombre de la promoción, si es una con nombre: «Buen Fin» (5 al 17-nov-2026). Sin él, la oferta de lanzamiento */
    label?: string | null
    /** Su permanencia, si la tiene (Elite y Área en el Buen Fin): el registro le enseña los términos y le pide aceptarlos */
    commitment?: IPlanOfferCommitment | null
}

/** La permanencia de una oferta: si cancela antes de `months` meses, paga el descuento de los meses que usó */
export interface IPlanOfferCommitment {
    months: number
    /** Los términos, en la web pública (eyplease.com.mx/terminos-buen-fin/) */
    terms_url: string
    /** La versión que acepta (`buen-fin-2026-v1`): se manda en el alta como `promo_terms_version` */
    terms_version: string
}

export enum PlanKeys {
    FREE = 'free',
    STANDARD = 'standard',
    BASIC = 'basic',
    EXECUTIVE = 'executive',
    ELITE = 'elite',
    NATIONAL = 'national'
}
import { createContext, useContext } from 'react'

import { BillingRestrictedFeature, IBillingEnforcement, IBillingPaymentMethod, ICurrentPayment } from '@/interfaces/billing'
import { NO_ENFORCEMENT } from './utils'

export interface BillingEnforcementValue {
    enforcement: IBillingEnforcement
    payment: ICurrentPayment | null
    paymentMethod?: IBillingPaymentMethod
    isFeatureRestricted: (feature: BillingRestrictedFeature) => boolean
    /**
     * La puerta. Devuelve true si puede pasar; si la función está cerrada abre el
     * aviso de pago pendiente y devuelve false. Quien navega a una función
     * cerrable la llama antes de navegar.
     */
    requestFeature: (feature: BillingRestrictedFeature) => boolean
    openPaymentDialog: (feature?: BillingRestrictedFeature) => void
    openUploadReceipt: () => void
}

export const BillingEnforcementContext = createContext<BillingEnforcementValue | null>(null)

/** Fuera del provider (rutas públicas) devuelve un estado vacío en vez de romper. */
const EMPTY_VALUE: BillingEnforcementValue = {
    enforcement: NO_ENFORCEMENT,
    payment: null,
    paymentMethod: undefined,
    isFeatureRestricted: () => false,
    requestFeature: () => true,
    openPaymentDialog: () => undefined,
    openUploadReceipt: () => undefined,
}

export const useBillingEnforcement = () => useContext(BillingEnforcementContext) ?? EMPTY_VALUE

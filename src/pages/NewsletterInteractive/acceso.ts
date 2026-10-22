import type { IUser } from '@/interfaces/users'

/** El boletín dinámico viene en los planes Elite y Nacional (David, 22-oct-2026). La API pide lo mismo. */
const PLANES = ['elite', 'national']

/**
 * Mientras se prueba con Directoras reales, además sólo lo ven estas cuentas (el bloque «Nuevo» del Studio y la
 * página). Para abrirlo a todas las de esos planes: `null`. En el simulador de cuentas (sólo dev) no aplica.
 */
const CUENTAS_DE_PRUEBA: string[] | null = ['028616']

export const planConBoletinDinamico = (user?: IUser | null): boolean =>
    !!user?.plan?.plan_key && PLANES.includes(user.plan.plan_key)

export const puedeVerBoletinDinamico = (user?: IUser | null): boolean =>
    planConBoletinDinamico(user)
    && (import.meta.env.DEV || CUENTAS_DE_PRUEBA === null || (!!user?.account && CUENTAS_DE_PRUEBA.includes(user.account)))

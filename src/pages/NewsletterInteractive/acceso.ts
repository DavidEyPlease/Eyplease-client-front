import { APP_ROUTES } from '@/constants/app'
import type { IUser } from '@/interfaces/users'

/** El boletín dinámico viene en los planes Elite y Nacional (David, 22-oct-2026). La API pide lo mismo. */
const PLANES = ['elite', 'national']

/**
 * Para probar algo nuevo con Directoras reales antes de abrirlo: sólo estas cuentas lo ven (el bloque «Nuevo», la
 * página, el formato «Interactivo» y el aviso). `null` = todas las de su plan. Abierto a todas el 22-oct-2026 (David:
 * «ya es momento de abrirla a todas»); la cuenta de prueba fue la 028616.
 */
const CUENTAS_DE_PRUEBA = null as string[] | null

/** La unidad de ejemplo es el cierre de septiembre de 2026 (piel de la Plantilla 9). */
export const MES_DEL_EJEMPLO = '2026-09'

const lanzado = (user?: IUser | null): boolean =>
    import.meta.env.DEV || CUENTAS_DE_PRUEBA === null || (!!user?.account && CUENTAS_DE_PRUEBA.includes(user.account))

export const planConBoletinDinamico = (user?: IUser | null): boolean =>
    !!user?.plan?.plan_key && PLANES.includes(user.plan.plan_key)

export const puedeVerBoletinDinamico = (user?: IUser | null): boolean => planConBoletinDinamico(user) && lanzado(user)

/** A las de los demás planes se les enseña con candado y con la unidad de ejemplo, para que sepan que existe. */
export const ofrecerBoletinDinamico = (user?: IUser | null): boolean => !!user && !planConBoletinDinamico(user) && lanzado(user)

/** La plantilla que trae versión interactiva (su piel en public/boletin/<piel>): la 9 y la 10. Se reconoce por el nombre. */
export const pielDePlantilla = (nombre?: string | null): 'p9' | 'p10' | null => {
    const numero = nombre?.match(/\b(\d+)\b/)?.[1]
    return numero === '9' ? 'p9' : numero === '10' ? 'p10' : null
}

/** «Lo quiero en mi unidad»: directo a subir al Plan Elite (paga con tarjeta y se le abre en ese momento). */
export const LIGA_LO_QUIERO = `${APP_ROUTES.HOME.PLAN_UPGRADE}?plan=elite`

/** El boletín NACIONAL interactivo viene sólo en el plan Nacional. La API pide lo mismo. */
const PLANES_NACIONAL = ['national']

/** Para probarlo con cuentas reales antes de abrirlo: sólo estas lo ven. `null` = todas las Nacionales. Abierto a todas el
 *  26-oct-2026 (David: «ya lo revisé, colócalo para las demás»); la cuenta de prueba fue la 028616. */
const CUENTAS_DE_PRUEBA_NACIONAL = null as string[] | null

export const puedeVerBoletinNacional = (user?: IUser | null): boolean =>
    !!user?.plan?.plan_key && PLANES_NACIONAL.includes(user.plan.plan_key)
    && (import.meta.env.DEV || CUENTAS_DE_PRUEBA_NACIONAL === null || (!!user.account && CUENTAS_DE_PRUEBA_NACIONAL.includes(user.account)))

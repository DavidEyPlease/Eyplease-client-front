import type { IUser } from '@/interfaces/users'

/** El boletín dinámico viene en los planes Elite y Nacional (David, 22-oct-2026). La API pide lo mismo. */
const PLANES = ['elite', 'national']

/**
 * Mientras se prueba con Directoras reales, además sólo lo ven estas cuentas (el bloque «Nuevo» del Studio y la
 * página). Para abrirlo a todas las de esos planes: `null`. En el simulador de cuentas (sólo dev) no aplica.
 */
const CUENTAS_DE_PRUEBA: string[] | null = ['028616']

/** La unidad de ejemplo es el cierre de septiembre de 2026 (piel de la Plantilla 9). */
export const MES_DEL_EJEMPLO = '2026-09'

const lanzado = (user?: IUser | null): boolean =>
    import.meta.env.DEV || CUENTAS_DE_PRUEBA === null || (!!user?.account && CUENTAS_DE_PRUEBA.includes(user.account))

export const planConBoletinDinamico = (user?: IUser | null): boolean =>
    !!user?.plan?.plan_key && PLANES.includes(user.plan.plan_key)

export const puedeVerBoletinDinamico = (user?: IUser | null): boolean => planConBoletinDinamico(user) && lanzado(user)

/** A las de los demás planes se les enseña con candado y con la unidad de ejemplo, para que sepan que existe. */
export const ofrecerBoletinDinamico = (user?: IUser | null): boolean => !!user && !planConBoletinDinamico(user) && lanzado(user)

/** «Lo quiero en mi unidad»: un WhatsApp a Eyplease+ ya escrito, con quién es, para que Ventas le cambie el plan. */
export const ligaLoQuiero = (user?: IUser | null): string => {
    const quien = user ? `Hola, soy ${user.name} (cuenta ${user.account}).` : 'Hola.'
    const texto = `${quien} Vi el boletín interactivo y lo quiero para mi unidad. ¿Cómo subo de plan?`
    return `https://api.whatsapp.com/send/?phone=${import.meta.env.VITE_WS_NUMBER ?? ''}&text=${encodeURIComponent(texto)}&type=phone_number&app_absent=0`
}

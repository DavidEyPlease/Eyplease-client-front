/**
 * Mientras se prueba con Directoras reales, el boletín dinámico sólo lo ven estas cuentas (el bloque «Nuevo» del
 * Studio y la página). Para abrirlo a todas: `null`. En el simulador de cuentas (sólo dev) siempre se ve.
 */
const CUENTAS_DE_PRUEBA: string[] | null = ['028616']

export const puedeVerBoletinDinamico = (account?: string | null): boolean =>
    import.meta.env.DEV || CUENTAS_DE_PRUEBA === null || (!!account && CUENTAS_DE_PRUEBA.includes(account))

import useAuthStore from '@/store/auth'

/**
 * La empresa de venta directa de la cuenta (`company` de /me). Hasta noviembre de 2026 todas eran de Mary Kay; la primera
 * de otra empresa es una líder de Zermat. Sin el dato (una API anterior), es Mary Kay, como siempre.
 *
 * A una de otra empresa se le esconde lo que sólo sirve con Mary Kay aunque su plan no lo pida: Indicadores (sus números
 * salen de los reportes de InTouch), Tu estrategia (sus órdenes de Mary Kay) y el Asistente (sabe de Mary Kay).
 */
export type Company = 'mary_kay' | 'zermat'

export const isMaryKay = (user?: { company?: Company | string | null } | null): boolean =>
    !user?.company || user.company === 'mary_kay'

export const useIsMaryKay = (): boolean => useAuthStore(state => isMaryKay(state.user))

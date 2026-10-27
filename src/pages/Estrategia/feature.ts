import { BoxIcon, SparklesIcon } from 'lucide-react'

import { APP_ROUTES } from '@/constants/app'
import { PermissionKeys } from '@/interfaces/permissions'
import useAuthStore from '@/store/auth'

/**
 * Interruptor de «Tu estrategia», «Tu inventario» y «Ya me compró» en la web (plan Standard de consultora).
 *
 * Apagado en la web publicada mientras no exista el cobro del plan ($139): la API ya está en producción, pero la
 * entrada (la tarjeta del Hoy, las dos filas de «Mi negocio» y «Sus compras» en Mis Clientas) no se enseña. En el
 * servidor local (`pnpm dev` y el simulador de cuentas) se ve siempre, para probarlo. Para abrirlo a todas las
 * consultoras se pone en `true` y se sube; cuando exista el plan, la entrada se cuelga de su permiso.
 */
export const TU_ESTRATEGIA_EN_LA_WEB = false

/** ¿Se le enseña? Sólo a cuentas de consultora (su plan no trae unidad) y con el interruptor encendido. */
const useStrategyEntry = (): boolean => {
    const consultant = useAuthStore(state => !!state.user && !state.permissions.includes(PermissionKeys.POSTS_UNITY))
    return consultant && (TU_ESTRATEGIA_EN_LA_WEB || import.meta.env.DEV)
}

export default useStrategyEntry

/** Las dos páginas, para «Mi negocio» de la barra de arriba y para el buscador (⌘K) */
export const STRATEGY_LINKS = [
    { key: 'strategy', label: 'Tu estrategia', hint: 'Qué ofrecer este mes, cuánto ganas y las piezas para tus clientas', path: APP_ROUTES.STRATEGY, Icon: SparklesIcon },
    { key: 'inventory', label: 'Tu inventario', hint: 'Lo que compraste, lo que te queda y lo que te costó', path: APP_ROUTES.INVENTORY, Icon: BoxIcon },
]

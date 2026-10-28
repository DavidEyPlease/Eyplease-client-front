import { BoxIcon, LockIcon, SparklesIcon } from 'lucide-react'

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

/** El código con el que la API rechaza «Tu estrategia» en los planes gratis (EnsureStrategyPlan) */
export const STRATEGY_LOCKED_CODE = 'PLAN_REQUIRED_STRATEGY'
export const isStrategyLockedError = (error: unknown) => (error as { message?: string } | null)?.message === STRATEGY_LOCKED_CODE

/**
 * ¿Se le enseña y con candado? A las consultoras (su plan no trae unidad) con el interruptor encendido: con plan de
 * paga, abierta; con un plan gratis (la Gratis Consultora), con candado: ve el ejemplo y «Contratar el Plan Standard».
 */
export const useStrategyAccess = (): { show: boolean, locked: boolean } => {
    const consultant = useAuthStore(state => !!state.user && (state.user.plan?.audience === 'clients' || !state.permissions.includes(PermissionKeys.POSTS_UNITY)))
    const free = useAuthStore(state => (state.user?.plan?.plan_key ?? '').startsWith('free'))
    const show = consultant && (TU_ESTRATEGIA_EN_LA_WEB || import.meta.env.DEV)
    return { show, locked: show && free }
}

/** Lo que necesita su estrategia abierta (Mis Clientas: «Sus compras» y «Ya me compró»): sólo con plan de paga. */
const useStrategyEntry = (): boolean => {
    const { show, locked } = useStrategyAccess()
    return show && !locked
}

export default useStrategyEntry

/** Las dos páginas, para «Mi negocio» de la barra de arriba y para el buscador (⌘K); con candado, dicen con qué plan viene */
export const STRATEGY_LINKS = [
    { key: 'strategy', label: 'Tu estrategia', hint: 'Qué ofrecer este mes, cuánto ganas y las piezas para tus clientas', path: APP_ROUTES.STRATEGY, Icon: SparklesIcon },
    { key: 'inventory', label: 'Tu inventario', hint: 'Lo que compraste, lo que te queda y lo que te costó', path: APP_ROUTES.INVENTORY, Icon: BoxIcon },
]

/** Con candado, la fila dice con qué plan viene */
export const strategyLinks = (locked: boolean) => locked
    ? STRATEGY_LINKS.map(link => ({ ...link, Icon: LockIcon, hint: `Viene con el Plan Standard. ${link.hint}` }))
    : STRATEGY_LINKS

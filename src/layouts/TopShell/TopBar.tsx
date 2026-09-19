import { Link, useLocation, useNavigate } from 'react-router'
import { BadgeCheckIcon, ChevronDownIcon, LogOutIcon, PanelRightIcon, UndoIcon } from 'lucide-react'

import { APP_ROUTES } from '@/constants/app'
import { DarkModeSelector } from '@/components/common/DarkModeSelector'
import LoggedUserAvatar from '@/components/generics/LoggedUserAvatar'
import { NotificationsDropdown } from '@/components/generics/Notifications'
import { ICONS } from '@/components/sidebar/icons'
import {
    DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import useAuth from '@/hooks/useAuth'
import { MenuItem, MenuKeys } from '@/interfaces/common'
import { cn } from '@/lib/utils'
import useAuthStore from '@/store/auth'
import { setNewShell } from './useNewShell'

/**
 * Cómo se reparte el menú de siempre en la barra. NO inventa entradas: agrupa las que ya
 * trae `sidebarMenu`, que llega filtrado por los permisos del plan. Un grupo al que el plan
 * le deja una sola entrada se pinta como enlace directo; uno vacío no se pinta.
 */
const DIRECT_FIRST: MenuKeys[] = [MenuKeys.HOME]
const GROUPS: Array<{ label: string, keys: MenuKeys[] }> = [
    { label: 'Mi negocio', keys: [MenuKeys.POSTS, MenuKeys.GALLERY, MenuKeys.MY_CLIENTS] },
    { label: 'Contenido', keys: [MenuKeys.TOOLS, MenuKeys.TRAININGS, MenuKeys.SERVICES] },
]
const DIRECT_LAST: MenuKeys[] = [MenuKeys.UPLOAD_REPORTS]

/** El nombre y la bajada con que se presenta cada entrada en el marco nuevo. */
const COPY: Partial<Record<MenuKeys, { label?: string, hint: string }>> = {
    [MenuKeys.HOME]: { label: 'Hoy', hint: 'Lo que pasó hoy en tu unidad' },
    [MenuKeys.POSTS]: { label: 'Mi unidad', hint: 'Lo que logró cada consultora y lo que falta compartirle' },
    [MenuKeys.GALLERY]: { hint: 'Las fotos de tu unidad para sus reconocimientos' },
    [MenuKeys.MY_CLIENTS]: { label: 'Mis clientas', hint: 'Sus cumpleaños con la pieza lista' },
    [MenuKeys.TOOLS]: { hint: 'Todo lo que la biblioteca preparó para que compartas' },
    [MenuKeys.TRAININGS]: { label: 'Entrenamiento', hint: 'Un tema nuevo cada lunes, listo para tu junta' },
    [MenuKeys.SERVICES]: { label: 'Pedidos de diseño', hint: 'Lo que le encargas al equipo y sus entregas' },
    [MenuKeys.UPLOAD_REPORTS]: { hint: 'Tus reportes de Mary Kay: los que se cargan solos y los que faltan' },
}
const labelOf = (item: MenuItem) => COPY[item.key]?.label ?? item.label

const NAV_BUTTON = 'relative flex h-[38px] cursor-pointer items-center gap-1.5 rounded-xl px-3 text-[13.5px] font-semibold text-muted-foreground transition-colors hover:bg-foreground/5 hover:text-foreground data-[state=open]:bg-foreground/5 data-[state=open]:text-foreground'

const ActiveBar = () => <span className="shell-grad absolute inset-x-3 bottom-[3px] h-[2.5px] rounded-full" />

interface Props {
    assistantOpen: boolean
    onToggleAssistant: () => void
}

const TopBar = ({ assistantOpen, onToggleAssistant }: Props) => {
    const { user, handleLogout } = useAuth()
    const sidebarMenu = useAuthStore(state => state.sidebarMenu)
    /* El boletín no es una entrada del menú de siempre (vivía dentro del Inicio): con el marco
       nuevo tiene su página, y el enlace sale sólo si el plan trae algún boletín. */
    const hasNewsletter = useAuthStore(state => state.utilData.newsletters.length > 0)
    const location = useLocation()
    const navigate = useNavigate()

    const byKey = new Map(sidebarMenu.map(item => [item.key, item]))
    const pick = (keys: MenuKeys[]) => keys.map(key => byKey.get(key)).filter((item): item is MenuItem => !!item)
    const isActive = (item: MenuItem) => location.pathname.includes(item.path)

    const direct = (item: MenuItem) => (
        <Link key={item.key} to={item.path} className={cn(NAV_BUTTON, isActive(item) && 'text-foreground')}>
            {labelOf(item)}
            {isActive(item) && <ActiveBar />}
        </Link>
    )

    return (
        <header className="shell-glass sticky top-3 z-40 mx-auto mt-3 flex h-[62px] w-[min(1500px,calc(100%-28px))] items-center gap-1.5 rounded-[20px] pr-2.5 pl-3.5">
            <Link to={APP_ROUTES.HOME.INITIAL} className="flex items-center gap-2.5 pr-2.5">
                <span className="shell-grad shell-mark grid size-9 place-items-center rounded-xl shadow-[0_8px_18px_-8px_rgba(108,71,255,.9)]">
                    <img src="/images/isotipo-blanco.png" alt="" className="relative z-[1] w-[21px]" />
                </span>
                <span className="hidden text-[15px] leading-none font-extrabold tracking-tight sm:block">
                    eyplease<span className="text-[#E5077D]">+</span>
                </span>
            </Link>

            <nav className="ml-1.5 hidden items-center gap-0.5 md:flex">
                {pick(DIRECT_FIRST).map(direct)}

                {hasNewsletter && (
                    <Link to={APP_ROUTES.HOME.NEWSLETTER} className={cn(NAV_BUTTON, location.pathname.includes(APP_ROUTES.HOME.NEWSLETTER) && 'text-foreground')}>
                        Boletín
                        {location.pathname.includes(APP_ROUTES.HOME.NEWSLETTER) && <ActiveBar />}
                    </Link>
                )}

                {GROUPS.map(group => {
                    const items = pick(group.keys)
                    if (!items.length) return null
                    if (items.length === 1) return direct(items[0])

                    const active = items.some(isActive)
                    return (
                        <DropdownMenu key={group.label}>
                            <DropdownMenuTrigger className={cn(NAV_BUTTON, 'group outline-none', active && 'text-foreground')}>
                                {group.label}
                                <ChevronDownIcon className="size-3.5 opacity-60 transition-transform duration-300 group-data-[state=open]:rotate-180" />
                                {active && <ActiveBar />}
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="start" sideOffset={12} className="shell-drop w-[340px] rounded-[20px] border-border p-2 shadow-[0_18px_50px_-24px_rgba(27,20,80,.5)]">
                                {items.map((item, index) => {
                                    const Icon = ICONS[item.icon]
                                    return (
                                        <DropdownMenuItem
                                            key={item.key}
                                            onClick={() => navigate(item.path)}
                                            style={{ '--i': index } as React.CSSProperties}
                                            className="shell-drop-row cursor-pointer gap-3 rounded-[14px] px-2.5 py-2.5"
                                        >
                                            <span className="shell-drop-icon grid size-[38px] shrink-0 place-items-center rounded-xl text-primary [&_svg]:size-[18px]">
                                                {Icon && <Icon />}
                                            </span>
                                            <span className="min-w-0">
                                                <b className="block text-[13.5px] font-bold">{labelOf(item)}</b>
                                                <small className="block text-[11.5px] text-muted-foreground">{COPY[item.key]?.hint}</small>
                                            </span>
                                        </DropdownMenuItem>
                                    )
                                })}
                            </DropdownMenuContent>
                        </DropdownMenu>
                    )
                })}

                {pick(DIRECT_LAST).map(direct)}
            </nav>

            <div className="ml-auto flex items-center gap-1">
                <button
                    type="button"
                    title={assistantOpen ? 'Plegar el Asistente' : 'Abrir el Asistente'}
                    onClick={onToggleAssistant}
                    className={cn('hidden size-[38px] cursor-pointer place-items-center rounded-xl text-muted-foreground transition-colors hover:bg-foreground/5 hover:text-foreground lg:grid', assistantOpen && 'text-primary')}
                >
                    <PanelRightIcon className="size-[18px]" />
                </button>
                <DarkModeSelector />
                <NotificationsDropdown />

                <DropdownMenu>
                    <DropdownMenuTrigger className="group ml-1 flex cursor-pointer items-center gap-2 rounded-[14px] py-1 pr-2 pl-1 outline-none transition-colors hover:bg-foreground/5 data-[state=open]:bg-foreground/5">
                        {user && <LoggedUserAvatar user={user} />}
                        <span className="hidden text-left leading-tight whitespace-nowrap sm:block">
                            <b className="block max-w-[140px] truncate text-[12.5px] font-bold">{user?.name}</b>
                            <small className="block text-[10.5px] text-muted-foreground">{user?.account}</small>
                        </span>
                        <ChevronDownIcon className="size-3.5 opacity-55 transition-transform duration-300 group-data-[state=open]:rotate-180" />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" sideOffset={12} className="shell-drop min-w-60 rounded-[20px] p-2">
                        <DropdownMenuLabel className="px-2.5 pt-2 pb-1 text-[10px] font-extrabold tracking-[.12em] text-muted-foreground uppercase">Tu cuenta</DropdownMenuLabel>
                        <DropdownMenuItem className="cursor-pointer gap-2.5 rounded-xl px-2.5 py-2" onClick={() => navigate(APP_ROUTES.HOME.PROFILE)}>
                            <BadgeCheckIcon /> Perfil
                        </DropdownMenuItem>
                        <DropdownMenuItem className="cursor-pointer gap-2.5 rounded-xl px-2.5 py-2" onClick={() => setNewShell(false)}>
                            <UndoIcon /> Volver al diseño anterior
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="cursor-pointer gap-2.5 rounded-xl px-2.5 py-2" onClick={handleLogout}>
                            <LogOutIcon /> Cerrar sesión
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </header>
    )
}

export default TopBar

import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router'
import { BadgeCheckIcon, ChartNoAxesColumnIcon, NewspaperIcon, SearchIcon, SparklesIcon, UsersRoundIcon } from 'lucide-react'

import { ICONS } from '@/components/sidebar/icons'
import { CommandDialog, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command'
import { APP_ROUTES } from '@/constants/app'
import { PermissionKeys } from '@/interfaces/permissions'
import useAuthStore from '@/store/auth'
import { askAssistant } from './assistantBridge'

const IS_MAC = typeof navigator !== 'undefined' && /mac/i.test(navigator.platform)

/** Lo que la IA sí sabe hacer: sus pedidos de diseño y consultar su unidad, sus piezas, sus clientas y sus reportes. Las mismas del saludo del panel. */
const QUESTIONS: Array<{ text: string, needs: PermissionKeys }> = [
    /* La IA entrevista y crea el pedido: es un mensaje más, no un flujo aparte */
    { text: 'Quiero pedir un diseño', needs: PermissionKeys.SERVICES },
    { text: '¿Cómo va mi unidad este mes?', needs: PermissionKeys.POSTS_UNITY },
    { text: '¿Quién no ha pedido este mes?', needs: PermissionKeys.POSTS_UNITY },
    { text: '¿Qué piezas me faltan por compartir?', needs: PermissionKeys.POSTS_UNITY },
    { text: '¿Cómo van mis pedidos?', needs: PermissionKeys.SERVICES },
]

interface Props {
    /** Nombres con los que el marco presenta cada entrada del menú */
    labelOf: (key: string, fallback: string) => string
}

/**
 * La barra ⌘K: ir a cualquier página escribiendo su nombre o pedirle algo al Asistente sin
 * buscar el panel. Lo que se escribe y no es una página se le manda tal cual al chat.
 */
const CommandBar = ({ labelOf }: Props) => {
    const navigate = useNavigate()
    const sidebarMenu = useAuthStore(state => state.sidebarMenu)
    const hasNewsletter = useAuthStore(state => state.utilData.newsletters.length > 0)
    const permissions = useAuthStore(state => state.permissions)
    const hasUnit = permissions.includes(PermissionKeys.POSTS_UNITY)
    const [open, setOpen] = useState(false)
    const [query, setQuery] = useState('')

    useEffect(() => {
        const onKey = (event: KeyboardEvent) => {
            if (event.key.toLowerCase() === 'k' && (event.metaKey || event.ctrlKey)) {
                event.preventDefault()
                setOpen(value => !value)
            }
        }
        window.addEventListener('keydown', onKey)
        return () => window.removeEventListener('keydown', onKey)
    }, [])

    useEffect(() => { if (!open) setQuery('') }, [open])

    const go = (path: string) => { setOpen(false); navigate(path) }
    const ask = (text: string) => { setOpen(false); askAssistant(text) }

    const pages = [
        ...sidebarMenu.map(item => ({ key: item.key.toString(), label: labelOf(item.key.toString(), item.label), path: item.path, Icon: ICONS[item.icon] })),
        ...(hasNewsletter ? [{ key: 'newsletter', label: 'Boletín', path: APP_ROUTES.HOME.NEWSLETTER, Icon: NewspaperIcon }] : []),
        ...(hasUnit ? [
            { key: 'indicators', label: 'Indicadores', path: APP_ROUTES.INDICATORS, Icon: ChartNoAxesColumnIcon },
            { key: 'my-unit', label: 'Mi unidad', path: APP_ROUTES.MY_UNIT, Icon: UsersRoundIcon },
        ] : []),
        { key: 'profile', label: 'Perfil', path: APP_ROUTES.HOME.PROFILE, Icon: BadgeCheckIcon },
    ]

    const typed = query.trim()

    return (
        <>
            <button
                type="button"
                onClick={() => setOpen(true)}
                className="ml-2 hidden h-[38px] min-w-0 flex-1 cursor-text items-center gap-2 rounded-xl border border-border bg-foreground/[.03] px-3 text-[12.5px] text-muted-foreground transition-colors hover:border-[#6C47FF]/40 hover:bg-foreground/[.05] lg:flex lg:max-w-[300px]"
            >
                <SearchIcon className="size-[15px] shrink-0" />
                <span className="min-w-0 flex-1 truncate text-left">Busca o pídele algo al Asistente…</span>
                <kbd className="shrink-0 rounded-md border border-border bg-card/70 px-1.5 py-0.5 text-[10px] font-bold">{IS_MAC ? '⌘' : 'Ctrl'} K</kbd>
            </button>

            <CommandDialog open={open} onOpenChange={setOpen} title="Buscar o pedir" description="Ve a una página o pídele algo al Asistente" className="shell-drop top-[22%] translate-y-0 rounded-[22px] sm:max-w-[560px]">
                <CommandInput value={query} onValueChange={setQuery} placeholder="Escribe una página o lo que necesitas…" />
                <CommandList className="max-h-[52vh]">
                    <CommandEmpty>Nada con ese nombre. Pulsa Enter abajo para pedírselo al Asistente.</CommandEmpty>

                    {typed.length > 2 && (
                        <CommandGroup heading="Asistente" forceMount>
                            <CommandItem forceMount value={`preguntar ${typed}`} onSelect={() => ask(typed)} className="cursor-pointer gap-3 rounded-xl">
                                <span className="shell-grad grid size-8 shrink-0 place-items-center rounded-[10px] text-white"><SparklesIcon className="!size-4" /></span>
                                <span className="min-w-0 truncate">Pedirle al Asistente: <b>«{typed}»</b></span>
                            </CommandItem>
                        </CommandGroup>
                    )}

                    <CommandGroup heading="Ir a">
                        {pages.map(({ key, label, path, Icon }) => (
                            <CommandItem key={key} value={label} onSelect={() => go(path)} className="cursor-pointer gap-3 rounded-xl">
                                <span className="shell-drop-icon grid size-8 shrink-0 place-items-center rounded-[10px] text-primary [&_svg]:!size-4">{Icon && <Icon />}</span>
                                {label}
                            </CommandItem>
                        ))}
                    </CommandGroup>

                    <CommandGroup heading="Pídele al Asistente">
                        {QUESTIONS.filter(question => permissions.includes(question.needs)).map(({ text }) => (
                            <CommandItem key={text} value={text} onSelect={() => ask(text)} className="cursor-pointer gap-3 rounded-xl">
                                <span className="shell-drop-icon grid size-8 shrink-0 place-items-center rounded-[10px] text-primary"><SparklesIcon className="!size-4" /></span>
                                {text}
                            </CommandItem>
                        ))}
                    </CommandGroup>
                </CommandList>
            </CommandDialog>
        </>
    )
}

export default CommandBar

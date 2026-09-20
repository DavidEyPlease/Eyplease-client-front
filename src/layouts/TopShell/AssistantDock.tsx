import { useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router'
import { ArrowLeftIcon, HistoryIcon, PlusIcon, XIcon } from 'lucide-react'

import ChatComposer from '@/components/assistant/ChatComposer'
import ChatThread, { ChatIntro } from '@/components/assistant/ChatThread'
import ConversationList from '@/components/assistant/ConversationList'
import useAssistantChat from '@/components/assistant/useAssistantChat'
import useDesignRequest, { wantsDesign } from '@/components/assistant/useDesignRequest'
import { APP_ROUTES } from '@/constants/app'
import { IChatOption } from '@/interfaces/chat'
import { PermissionKeys } from '@/interfaces/permissions'
import { cn } from '@/lib/utils'
import useAuthStore from '@/store/auth'
import { useAssistantRequests } from './assistantBridge'

const ACTION = 'flex cursor-pointer items-center gap-1.5 rounded-lg px-2 py-1.5 text-[11.5px] font-semibold text-muted-foreground transition-colors hover:bg-foreground/5 hover:text-foreground'

const Orb = ({ className }: { className?: string }) => (
    <span className={cn('shell-grad shell-orb grid shrink-0 place-items-center rounded-full', className)}>
        <img src="/images/isotipo-blanco.png" alt="" className="relative w-1/2" />
    </span>
)

/** Lo que dispara el flujo guiado desde el saludo o desde ⌘K */
export const DESIGN_REQUEST_LABEL = 'Pídeme un diseño'

/**
 * El saludo depende del plan, igual que en la app (su `pages/Assistant`): a quien su plan no le
 * trae los pedidos de diseño no se le ofrece pedirlos ni preguntar por ellos.
 *
 * «Pídeme un diseño» es un flujo GUIADO (`useDesignRequest`) que acaba creando el pedido; lo demás
 * son preguntas al chat libre (`/chat/services`), que sabe de pedidos, indicadores y retos pero
 * sólo LEE. Los retos se piden en Indicadores («Proponme un reto»), no aquí.
 */
const buildIntro = (name: string | undefined, hasServices: boolean): ChatIntro => {
    const first = (name ?? '').trim().split(/\s+/)[0] ?? ''
    const hola = first ? `Hola, ${first.charAt(0).toUpperCase()}${first.slice(1).toLowerCase()}` : 'Hola'

    return hasServices
        ? {
            title: `${hola}.`,
            text: 'Pídeme un diseño y yo lo mando a hacer, o pregúntame cómo va tu unidad este mes, tus pedidos o tus retos.',
            suggestions: [DESIGN_REQUEST_LABEL, '¿Cómo va mi unidad este mes?', '¿Cómo van mis pedidos?', '¿Qué retos tengo activos?'],
        }
        : {
            title: `${hola}.`,
            text: 'Pregúntame cómo va tu unidad este mes o qué retos tienes.',
            suggestions: ['¿Cómo va mi unidad este mes?', '¿Qué retos tengo activos?'],
        }
}

interface Props {
    open: boolean
    onOpenChange: (open: boolean) => void
}

/**
 * El Asistente, acoplado a la derecha y siempre a la vista.
 *
 * Es EL MISMO chat que ya existía (`useAssistantChat`, contra `/chat/services`): antes vivía
 * detrás de un botón que sólo salía en Servicios, y ahora acompaña en todas las páginas. El
 * hilo vive aquí, por encima de las páginas, así que cambiar de sección no pierde la
 * conversación.
 *
 * Plegado se queda como la burbuja que brilla, la misma de la pestaña central de la app.
 */
const AssistantDock = ({ open, onOpenChange }: Props) => {
    const [view, setView] = useState<'chat' | 'history'>('chat')
    const {
        conversationId, messages, sending, loadingHistory, deleting,
        send, openConversation, startNewChat, removeConversation,
    } = useAssistantChat()

    const navigate = useNavigate()
    const design = useDesignRequest()
    const referenceInput = useRef<HTMLInputElement>(null)

    const user = useAuthStore(state => state.user)
    const permissions = useAuthStore(state => state.permissions)
    const hasServices = permissions.includes(PermissionKeys.SERVICES)
    const intro = buildIntro(user?.name, hasServices)

    const isHistory = view === 'history'

    /* El flujo guiado vive sólo en pantalla: sus burbujas se intercalan con las del chat por hora */
    const thread = useMemo(
        () => [...messages, ...design.messages].sort((a, b) => a.created_at.localeCompare(b.created_at)),
        [messages, design.messages],
    )

    /**
     * Todo lo que se escribe pasa por aquí: si el flujo de diseño está esperando texto, es para él;
     * si lo que escribe es pedir un diseño, arranca el flujo (el chat libre sólo lee y no podría
     * crearlo); lo demás va al chat.
     */
    const onSend = async (text: string) => {
        if (design.capturesText) return design.onText(text)
        if (hasServices && (text === DESIGN_REQUEST_LABEL || wantsDesign(text))) {
            design.start(text)
            return true
        }
        return send(text)
    }

    const onOption = async (option: IChatOption) => {
        const next = await design.onOption(option.value, option.label)
        if (next === 'attach') referenceInput.current?.click()
        if (next === 'orders') navigate(APP_ROUTES.SERVICES)
    }

    const newChat = () => {
        design.reset()
        startNewChat()
        setView('chat')
    }

    /* Los encargos que llegan de las páginas o de ⌘K: se abre, vuelve al chat y lo atiende */
    useAssistantRequests(text => {
        onOpenChange(true)
        setView('chat')
        onSend(text)
    })

    if (!open) {
        return (
            <button
                type="button"
                aria-label="Abrir el Asistente"
                onClick={() => onOpenChange(true)}
                className="fixed right-6 bottom-6 z-40 cursor-pointer rounded-full border-[3px] border-background transition-transform duration-300 hover:scale-105"
            >
                <Orb className="size-[58px]" />
            </button>
        )
    }

    return (
        <aside className="hidden w-[372px] shrink-0 self-stretch lg:block">
            {/* `self-stretch` + sticky: la columna mide todo el alto de la página y el panel viaja
                por ella, así el Asistente acompaña al hacer scroll en vez de irse con el contenido. */}
            <div className="shell-glass sticky top-[90px] flex h-[calc(100vh-110px)] flex-col overflow-hidden rounded-3xl">
                <div className="flex shrink-0 items-center gap-3 border-b border-border px-3.5 py-3">
                    <Orb className="size-[42px]" />
                    <div className="min-w-0 flex-1">
                        <b className="block text-[14.5px] font-extrabold">Asistente</b>
                        <small className="flex items-center gap-1.5 text-[11.5px] text-muted-foreground">
                            <i className="size-1.5 rounded-full bg-emerald-500 shadow-[0_0_0_3px_rgba(16,185,129,.2)]" />
                            Conoce tus pedidos, tus números y tus retos
                        </small>
                    </div>
                    <button type="button" title="Plegar" onClick={() => onOpenChange(false)} className="grid size-9 cursor-pointer place-items-center rounded-xl text-muted-foreground transition-colors hover:bg-foreground/5 hover:text-foreground">
                        <XIcon className="size-[18px]" />
                    </button>
                </div>

                <div className="flex shrink-0 items-center justify-end gap-1 px-2.5 pt-1.5">
                    <button type="button" className={ACTION} onClick={() => setView(isHistory ? 'chat' : 'history')}>
                        {isHistory ? <ArrowLeftIcon className="size-3.5" /> : <HistoryIcon className="size-3.5" />}
                        {isHistory ? 'Volver al chat' : 'Historial'}
                    </button>
                    {!isHistory && (
                        <button type="button" className={cn(ACTION, 'text-primary hover:text-primary')} onClick={newChat}>
                            <PlusIcon className="size-3.5" /> Nueva
                        </button>
                    )}
                </div>

                {/* `min-h-0`: sin él, al crecer la conversación empuja la cabecera fuera del panel */}
                <div className="flex min-h-0 flex-1 flex-col">
                    {isHistory ? (
                        <ConversationList
                            className="flex-1"
                            activeId={conversationId}
                            deleting={deleting}
                            onSelect={(id) => { design.reset(); openConversation(id); setView('chat') }}
                            onNew={newChat}
                            onDelete={removeConversation}
                        />
                    ) : (
                        <>
                            <ChatThread messages={thread} sending={sending || design.busy} loadingHistory={loadingHistory} onSuggestion={onSend} onOption={onOption} intro={intro} />
                            <ChatComposer
                                sending={sending || design.busy}
                                onSend={onSend}
                                placeholder={design.step === 'brief' ? 'Cuéntame qué necesitas…' : design.step === 'when' ? 'O escribe una fecha…' : hasServices ? 'Pídeme un diseño o pregúntame algo…' : 'Pregúntame algo…'}
                            />
                            {/* La referencia del pedido se elige aquí; se limpia para poder elegir el mismo archivo otra vez */}
                            <input
                                ref={referenceInput}
                                type="file"
                                accept="image/*,application/pdf"
                                className="hidden"
                                onChange={event => {
                                    const file = event.target.files?.[0]
                                    if (file) design.attach(file)
                                    event.target.value = ''
                                }}
                            />
                        </>
                    )}
                </div>
            </div>
        </aside>
    )
}

export default AssistantDock

import { useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { ArrowLeftIcon, HistoryIcon, PlusIcon, XIcon } from 'lucide-react'

import ChatComposer from '@/components/assistant/ChatComposer'
import ChatThread, { ChatIntro } from '@/components/assistant/ChatThread'
import ConversationList from '@/components/assistant/ConversationList'
import useAssistantChat, { ChatSendExtras } from '@/components/assistant/useAssistantChat'
import { PermissionKeys } from '@/interfaces/permissions'
import { cn } from '@/lib/utils'
import useAuthStore from '@/store/auth'
import { queryKeys } from '@/utils/cache'
import { useAssistantRequests } from './assistantBridge'

const ACTION = 'flex cursor-pointer items-center gap-1.5 rounded-lg px-2 py-1.5 text-[11.5px] font-semibold text-muted-foreground transition-colors hover:bg-foreground/5 hover:text-foreground'

const Orb = ({ className }: { className?: string }) => (
    <span className={cn('shell-grad shell-orb grid shrink-0 place-items-center rounded-full', className)}>
        <img src="/images/isotipo-blanco.png" alt="" className="relative w-1/2" />
    </span>
)

/** Con lo que arranca un pedido de diseño desde el saludo o desde ⌘K: es un mensaje para la IA, como cualquier otro */
export const DESIGN_REQUEST_LABEL = 'Quiero pedir un diseño'

/**
 * El saludo depende del plan, igual que en la app (su `pages/Assistant`): a quien su plan no le
 * trae los pedidos de diseño no se le ofrece pedirlos ni preguntar por ellos.
 *
 * TODO lo que escribe va a la IA (`/chat/services`, Claude con herramientas): ella SÍ crea pedidos
 * de diseño, pide correcciones y los cancela, además de leer sus números y sus retos. Aquí hubo un
 * guion de preguntas fijas que interceptaba «pídeme un diseño» creyendo que el chat sólo leía; se
 * quitó: repetía preguntas, no notaba lo que faltaba y registraba el pedido con la petición entera
 * como título. Cómo entrevista y cómo redacta el pedido se afina en la API (el prompt), no aquí.
 */
const buildIntro = (name: string | undefined, hasServices: boolean): ChatIntro => {
    const first = (name ?? '').trim().split(/\s+/)[0] ?? ''
    const hola = first ? `Hola, ${first.charAt(0).toUpperCase()}${first.slice(1).toLowerCase()}` : 'Hola'

    /* Fase 2 del Asistente: además de consultar (estatus de cada consultora, sus piezas, sus clientas,
       sus reportes) enseña piezas aquí mismo y, según el plan, hace cosas por ella con su sí (rehacer
       piezas, poner fotos, crear retos). Lo que depende del plan no se promete en el saludo: lo explica
       la IA si su plan no lo trae. */
    return hasServices
        ? {
            title: `${hola}.`,
            text: 'Conozco tu unidad, tus piezas y tus clientas. Pregúntame qué activas no han pedido o qué te falta compartir, pídeme que te enseñe una pieza, o pídeme un diseño con tus palabras.',
            suggestions: [DESIGN_REQUEST_LABEL, '¿Cómo va mi unidad este mes?', '¿Qué activas no han pedido este mes?', '¿Qué piezas me faltan por compartir?'],
        }
        : {
            title: `${hola}.`,
            text: 'Conozco tu unidad, tus piezas y tus clientas. Pregúntame qué activas no han pedido o qué te falta compartir, o pídeme que te enseñe una pieza.',
            suggestions: ['¿Cómo va mi unidad este mes?', '¿Qué activas no han pedido este mes?', '¿Qué piezas me faltan por compartir?', '¿Qué reportes me faltan?'],
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

    const queryClient = useQueryClient()
    const user = useAuthStore(state => state.user)
    const permissions = useAuthStore(state => state.permissions)
    const hasServices = permissions.includes(PermissionKeys.SERVICES)
    const intro = buildIntro(user?.name, hasServices)

    const isHistory = view === 'history'

    /**
     * La IA puede haber creado, corregido o cancelado un pedido en este turno, y el texto de su
     * respuesta no lo dice de forma fiable: tras cada respuesta se da por vieja la lista de Pedidos
     * de diseño (entidad `services`), que es barato y evita verla desactualizada.
     */
    const onSend = async (text: string, extras?: ChatSendExtras) => {
        const sent = await send(text, extras)
        if (sent && hasServices) queryClient.invalidateQueries({ queryKey: queryKeys.entity('services') })
        return sent
    }

    const newChat = () => {
        startNewChat()
        setView('chat')
    }

    /* Los encargos que llegan de las páginas o de ⌘K: se abre, vuelve al chat y se lo manda a la IA */
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
                            Conoce tu unidad, tus piezas y tus clientas
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
                            onSelect={(id) => { openConversation(id); setView('chat') }}
                            onNew={newChat}
                            onDelete={removeConversation}
                        />
                    ) : (
                        <>
                            <ChatThread messages={messages} sending={sending} loadingHistory={loadingHistory} onSuggestion={onSend} intro={intro} />
                            <ChatComposer sending={sending} onSend={onSend} allowAttachments={hasServices} placeholder={hasServices ? 'Pídeme un diseño o pregúntame algo…' : 'Pregúntame algo…'} />
                        </>
                    )}
                </div>
            </div>
        </aside>
    )
}

export default AssistantDock

import { useEffect, useRef } from 'react'

import { BrowserEvent, publishEvent, subscribeEvent, unsubscribeEvent } from '@/utils/events'

const ASK_EVENT = 'assistant:ask'

/**
 * «La página pide, el chat hace»: cualquier página (o la barra ⌘K) le pasa un encargo al
 * Asistente acoplado, que se abre y lo manda como si ella lo hubiera escrito. El hilo vive en el
 * panel, así que quien pide no necesita saber nada del chat.
 */
export const askAssistant = (text: string) => publishEvent(ASK_EVENT, text.trim())

/** Lo usa el panel del Asistente para recibir los encargos. */
export const useAssistantRequests = (onAsk: (text: string) => void) => {
    /* Siempre la última versión de quien escucha, sin volver a suscribirse en cada pintado */
    const handler = useRef(onAsk)
    handler.current = onAsk

    useEffect(() => {
        const listener = (event: Event) => {
            const text = (event as BrowserEvent<string>).detail
            if (text) handler.current(text)
        }
        subscribeEvent(ASK_EVENT, listener)
        return () => unsubscribeEvent(ASK_EVENT, listener)
    }, [])
}

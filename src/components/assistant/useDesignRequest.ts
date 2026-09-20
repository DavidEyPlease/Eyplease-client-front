import { useRef, useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'

import { API_ROUTES } from '@/constants/api'
import { IChatOption, IGuidedMessage } from '@/interfaces/chat'
import { ApiResponse } from '@/interfaces/common'
import { FileTypes } from '@/interfaces/files'
import HttpService from '@/services/http'
import useAuthStore from '@/store/auth'
import { queryKeys } from '@/utils/cache'
import { uploadFile } from '@/utils/files'

export type DesignStep = 'idle' | 'category' | 'brief' | 'when' | 'reference' | 'confirm' | 'sending' | 'done'

const WHEN_OPTIONS: IChatOption[] = [
    { label: 'Lo antes posible', value: 'Lo antes posible' },
    { label: 'Esta semana', value: 'Esta semana' },
    { label: 'La próxima semana', value: 'La próxima semana' },
    { label: 'No hay prisa', value: 'No hay prisa' },
]

/** Lo que alguien escribe cuando quiere encargar un diseño, con sus variantes: «pídeme», «necesito», «hazme»… */
const DESIGN_INTENT = /\b(pedir|pide|p[ií]deme|quiero|necesito|ocupo|hazme|haz|manda(?:r)? a hacer|encargar?)\b.{0,40}\bdise[ñn]o/i
export const wantsDesign = (text: string) => DESIGN_INTENT.test(text)

const uid = () => crypto.randomUUID()
const messageOf = (error: unknown) => (error as { message?: string })?.message ?? ''

/** El servidor pide un título: sale de la primera frase de lo que escribió. */
const titleFrom = (category: string, brief: string) => {
    const first = brief.split(/[.\n]/)[0].trim()
    const short = first.length > 60 ? `${first.slice(0, 57).trimEnd()}…` : first
    return `${category} · ${short}`
}

/**
 * «Pídeme un diseño»: conversación guiada (qué, para cuándo, referencia) que termina creando el
 * pedido en el servidor de siempre (`/request-services`), el mismo de la página Pedidos de diseño.
 * Es el flujo de la app, con su copy; aquí la referencia se elige con el selector de archivos.
 */
const useDesignRequest = () => {
    const queryClient = useQueryClient()
    const taskCategories = useAuthStore(state => state.utilData.task_categories)

    const [step, setStep] = useState<DesignStep>('idle')
    const [messages, setMessages] = useState<IGuidedMessage[]>([])
    const draft = useRef<{ categoryId: string, category: string, brief: string, when: string, reference: File | null }>(
        { categoryId: '', category: '', brief: '', when: '', reference: null },
    )

    const categories = (taskCategories || []).filter(category => category.slug !== 'system_task')

    const say = (message: Omit<IGuidedMessage, 'id' | 'created_at'>) =>
        setMessages(previous => [...previous, { id: uid(), created_at: new Date().toISOString(), ...message }])
    const me = (text: string, image?: string) => say({ role: 'user', text, image })
    const ai = (text: string, extra: Partial<IGuidedMessage> = {}) => say({ role: 'assistant', text, ...extra })

    const askBrief = () => {
        setStep('brief')
        ai('Cuéntame qué necesitas: para qué es, qué texto lleva y, si es un evento, fecha, hora y lugar.')
    }

    /** @param said lo que ella escribió para pedirlo, si no fue con el botón */
    const start = (said = 'Quiero pedir un diseño') => {
        draft.current = { categoryId: '', category: '', brief: '', when: '', reference: null }
        me(said)
        if (!categories.length) {
            draft.current.category = 'Diseño'
            askBrief()
            return
        }
        setStep('category')
        ai('Va. ¿Qué tipo de diseño necesitas?', { options: categories.map(category => ({ label: category.name, value: category.id })) })
    }

    const confirm = () => {
        const { category, brief, when, reference } = draft.current
        setStep('confirm')
        ai('Así lo mando a diseño:', {
            card: { rows: [['Tipo', category], ['Qué necesitas', brief], ['Para cuándo', when], ['Referencia', reference ? reference.name : 'Sin referencia']] },
            options: [{ label: 'Enviar a diseño', value: 'send', primary: true }, { label: 'Cambiar algo', value: 'edit' }],
        })
    }

    const send = async () => {
        const { categoryId, category, brief, when, reference } = draft.current
        setStep('sending')
        try {
            const response = await HttpService.post<ApiResponse<{ id: string }>>(API_ROUTES.CUSTOM_SERVICES.CREATE, {
                category: categoryId,
                title: titleFrom(category, brief),
                description: `${brief}\n\nPara cuándo: ${when}`,
                metadata: {},
            })
            const service = response.data

            /* La referencia se sube después: la carpeta del pedido lleva su id */
            let referenceFailed = false
            if (reference && service?.id) {
                try {
                    const extension = reference.name.split('.').pop()?.toLowerCase() || 'jpg'
                    const name = `referencia-${Date.now()}.${extension}`
                    const fileUri = await uploadFile({ file: reference, fileType: FileTypes.USER_REQUESTED_SERVICE, filename: `private/tasks/${service.id}/attachments/${name}` })
                    await HttpService.post(API_ROUTES.CUSTOM_SERVICES.UPLOAD_FILES.replace('{id}', service.id), {
                        file_uris: [{ fileUri, name, extension }],
                    })
                } catch {
                    referenceFailed = true
                }
            }

            /* La lista de Pedidos de diseño vive bajo la entidad `services` */
            queryClient.invalidateQueries({ queryKey: queryKeys.entity('services') })
            setStep('done')
            ai(
                referenceFailed
                    ? 'Listo, lo mandé a diseño, pero la referencia no se pudo subir. Puedes adjuntarla desde el pedido, en Pedidos de diseño.'
                    : 'Listo, lo mandé a diseño. Te aviso cuando esté; lo vas a ver en Pedidos de diseño, donde puedes pedir correcciones.',
                { options: [{ label: 'Ver mis pedidos', value: 'orders', primary: true }, { label: 'Pedir otro', value: 'again' }] },
            )
        } catch (error) {
            setStep('confirm')
            ai(`No se pudo crear el pedido${messageOf(error) ? `: ${messageOf(error)}` : ''}. ¿Lo intento otra vez?`, {
                options: [{ label: 'Reintentar', value: 'send', primary: true }, { label: 'Cambiar algo', value: 'edit' }],
            })
        }
    }

    /** Texto escrito mientras el flujo está activo. @returns true si lo consumió. */
    const onText = (text: string) => {
        if (step === 'brief') {
            draft.current.brief = text
            me(text)
            setStep('when')
            ai('¿Para cuándo lo necesitas?', { options: WHEN_OPTIONS })
            return true
        }
        if (step === 'when') {
            onOption(text, text)
            return true
        }
        return false
    }

    /** La foto o el diseño de referencia que eligió con el selector de archivos. */
    const attach = (file: File) => {
        if (step !== 'reference') return
        draft.current.reference = file
        me('Te mando esta referencia', file.type.startsWith('image/') ? URL.createObjectURL(file) : undefined)
        confirm()
    }

    /** @returns 'attach' si toca abrir el selector de archivos, 'orders' si toca llevarla a sus pedidos */
    const onOption = async (value: string, label: string): Promise<'attach' | 'orders' | void> => {
        if (step === 'category') {
            draft.current.categoryId = value
            draft.current.category = label
            me(label)
            askBrief()
            return
        }
        if (step === 'when') {
            draft.current.when = label
            me(label)
            setStep('reference')
            ai('¿Quieres mandar una foto o un diseño de referencia?', {
                options: [{ label: 'Adjuntar archivo', value: 'attach' }, { label: 'Sin referencia', value: 'skip' }],
            })
            return
        }
        if (step === 'reference') {
            if (value === 'attach') return 'attach'
            draft.current.reference = null
            me('Sin referencia')
            confirm()
            return
        }
        if (step === 'confirm') {
            if (value === 'send') {
                me('Enviar a diseño')
                await send()
            } else {
                me('Quiero cambiar algo')
                askBrief()
            }
            return
        }
        if (step === 'done') {
            if (value === 'orders') return 'orders'
            start()
        }
    }

    const reset = () => {
        setStep('idle')
        setMessages([])
    }

    return {
        step,
        messages,
        /** El cuadro de texto escribe para el flujo (no para el chat) en estos pasos */
        capturesText: step === 'brief' || step === 'when',
        busy: step === 'sending',
        start,
        onText,
        onOption,
        attach,
        reset,
    }
}

export default useDesignRequest

import { useCallback, useState } from 'react'
import { toast } from 'sonner'

import { FileTypes } from '@/interfaces/files'
import { IChatAttachmentRef } from '@/interfaces/chat'
import useAuthStore from '@/store/auth'
import { sanitizeFileName } from '@/utils'
import { uploadFile } from '@/utils/files'

export const MAX_CHAT_FILES = 5
const MAX_FILE_MB = 20
/** Lado mayor de la copia que VE la IA: es su tamaño recomendado; más grande sólo gasta y puede pasarse de su límite */
const PREVIEW_MAX_SIDE = 1568

export interface PendingAttachment extends IChatAttachmentRef {
    id: string
    /** Para pintar la miniatura sin volver a bajarla */
    localUrl: string | null
    status: 'uploading' | 'ready' | 'error'
}

/**
 * Una copia ligera en JPEG para que la IA la vea. La original se sube intacta: es la que recibe el
 * diseñador. Si el navegador no sabe abrir el formato (HEIC, PDF…) no hay copia y la IA no la ve,
 * pero el archivo se adjunta igual al pedido.
 */
const buildPreview = async (file: File): Promise<Blob | null> => {
    if (!file.type.startsWith('image/')) return null
    try {
        const bitmap = await createImageBitmap(file)
        const scale = Math.min(1, PREVIEW_MAX_SIDE / Math.max(bitmap.width, bitmap.height))
        const canvas = document.createElement('canvas')
        canvas.width = Math.round(bitmap.width * scale)
        canvas.height = Math.round(bitmap.height * scale)
        canvas.getContext('2d')?.drawImage(bitmap, 0, 0, canvas.width, canvas.height)
        bitmap.close()
        return await new Promise(resolve => canvas.toBlob(resolve, 'image/jpeg', 0.85))
    } catch {
        return null
    }
}

/**
 * Lo que ella adjunta en el chat antes de mandarlo. Se sube al elegirlo (no al enviar), a SU carpeta
 * del chat, así al pulsar Enter sólo viajan las referencias y el envío no espera a la subida.
 */
const useChatAttachments = () => {
    const user = useAuthStore(state => state.user)
    const [items, setItems] = useState<PendingAttachment[]>([])

    const patch = (id: string, data: Partial<PendingAttachment>) =>
        setItems(current => current.map(item => item.id === id ? { ...item, ...data } : item))

    const add = useCallback(async (files: File[]) => {
        /* La carpeta es la del USUARIO (no la de su ficha de red): es la que el servidor comprueba */
        const owner = user?.user_id ?? user?.id
        if (!owner || !files.length) return

        const room = MAX_CHAT_FILES - items.length
        if (room <= 0) return void toast.error(`Puedes mandar hasta ${MAX_CHAT_FILES} archivos por mensaje`)
        if (files.length > room) toast.message(`Sólo caben ${room} más: se adjuntaron los primeros`)

        for (const file of files.slice(0, room)) {
            if (file.size > MAX_FILE_MB * 1024 * 1024) {
                toast.error(`«${file.name}» pesa más de ${MAX_FILE_MB} MB`)
                continue
            }

            const id = crypto.randomUUID()
            const extension = (file.name.split('.').pop() || 'bin').toLowerCase()
            /* El nombre viaja en la ruta: es lo que verá el diseñador en el pedido */
            const base = `private/chat/${owner}/${id.slice(0, 8)}-${sanitizeFileName(file.name.replace(/\.[^.]+$/, '')).slice(0, 60)}`
            const fileUri = `${base}.${extension}`

            setItems(current => [...current, {
                id, fileUri, name: file.name, extension, previewUri: null, status: 'uploading',
                localUrl: file.type.startsWith('image/') ? URL.createObjectURL(file) : null,
            }])

            try {
                const preview = await buildPreview(file)
                const [, previewUri] = await Promise.all([
                    uploadFile({ file, fileType: FileTypes.USER_REQUESTED_SERVICE, filename: fileUri }),
                    preview
                        ? uploadFile({ file: new File([preview], 'vista.jpg', { type: 'image/jpeg' }), fileType: FileTypes.USER_REQUESTED_SERVICE, filename: `${base}.vista.jpg` })
                        : Promise.resolve(null),
                ])
                patch(id, { status: 'ready', previewUri: previewUri ?? null })
            } catch {
                patch(id, { status: 'error' })
                toast.error(`No se pudo subir «${file.name}»`)
            }
        }
    }, [items.length, user])

    const remove = (id: string) => setItems(current => current.filter(item => item.id !== id))
    const clear = () => setItems([])

    return {
        items,
        uploading: items.some(item => item.status === 'uploading'),
        ready: items.filter(item => item.status === 'ready'),
        add,
        remove,
        clear,
    }
}

export default useChatAttachments

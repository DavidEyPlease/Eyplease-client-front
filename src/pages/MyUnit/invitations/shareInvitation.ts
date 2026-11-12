import { shareFilesWithMessage } from '@/lib/share'

export type InviteOutcome = 'shared' | 'canceled' | 'downloaded'

/**
 * Manda la invitación: la imagen con el mensaje por la hoja de compartir del teléfono (ella elige WhatsApp y a la
 * consultora). El mensaje va copiado siempre, porque algunas versiones de WhatsApp sólo toman la imagen: así lo pega
 * (en iPhone, además, la imagen va sola: ver lib/share). Se copia SIN esperar, para que la hoja se abra en el mismo toque.
 * Sin hoja de compartir (computadora), baja la imagen y deja el mensaje copiado.
 */
const shareInvitation = async (blob: Blob | null, message: string, fileName: string): Promise<InviteOutcome> => {
    const copied = navigator.clipboard?.writeText(message).catch(() => { /* sin portapapeles: el mensaje sigue en pantalla */ })
    const files = blob ? [new File([blob], fileName, { type: 'image/jpeg' })] : []

    if (typeof navigator.share === 'function' && (!files.length || (typeof navigator.canShare === 'function' && navigator.canShare({ files })))) {
        try {
            await shareFilesWithMessage(files, message)
            return 'shared'
        } catch (error) {
            if ((error as { name?: string } | null)?.name === 'AbortError') return 'canceled'
            // Si el navegador no pudo, se baja como siempre
        }
    }

    await copied

    if (blob) {
        const url = URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        link.download = fileName
        document.body.appendChild(link)
        link.click()
        link.remove()
        setTimeout(() => URL.revokeObjectURL(url), 5000)
    }
    return 'downloaded'
}

export default shareInvitation

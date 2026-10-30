export type InviteOutcome = 'shared' | 'canceled' | 'downloaded'

/**
 * Manda la invitación: la imagen con el mensaje por la hoja de compartir del teléfono (ella elige WhatsApp y a la
 * consultora). El mensaje se copia ANTES, porque algunas versiones de WhatsApp sólo toman la imagen: así lo pega.
 * Sin hoja de compartir (computadora), baja la imagen y deja el mensaje copiado.
 */
const shareInvitation = async (blob: Blob | null, message: string, fileName: string): Promise<InviteOutcome> => {
    try { await navigator.clipboard.writeText(message) } catch { /* sin portapapeles: el mensaje sigue en pantalla */ }
    const files = blob ? [new File([blob], fileName, { type: 'image/jpeg' })] : []

    if (typeof navigator.share === 'function' && (!files.length || (typeof navigator.canShare === 'function' && navigator.canShare({ files })))) {
        try {
            await navigator.share(files.length ? { files, text: message } : { text: message })
            return 'shared'
        } catch (error) {
            if ((error as { name?: string } | null)?.name === 'AbortError') return 'canceled'
            // Si el navegador no pudo, se baja como siempre
        }
    }

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

import { SlideImage } from '@/hooks/useSlideImages'

export type ShareOutcome = 'shared' | 'canceled' | 'downloaded'

const fileName = (title: string, index: number) =>
    `${title.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 40) || 'pieza'}-${index + 1}.jpg`

/**
 * Comparte las láminas de una pieza con su mensaje. Si el navegador sabe compartir archivos (el teléfono, Safari,
 * Chrome en Windows), abre su hoja de compartir con todas de una vez; si no (o si ella lo pide), las baja y copia el
 * mensaje para que las mande desde WhatsApp Web.
 */
const shareSlides = async (images: SlideImage[], message: string, title: string, mode: 'share' | 'download' = 'share'): Promise<ShareOutcome> => {
    const files = images.flatMap((image, index) => image.blob ? [new File([image.blob], fileName(title, index), { type: 'image/jpeg' })] : [])

    if (mode === 'share' && files.length && typeof navigator.canShare === 'function' && navigator.canShare({ files })) {
        try {
            await navigator.share({ files, text: message })
            return 'shared'
        } catch (error) {
            if ((error as { name?: string } | null)?.name === 'AbortError') return 'canceled'
            // Si el navegador no pudo, se bajan como siempre
        }
    }

    files.forEach(file => {
        const url = URL.createObjectURL(file)
        const link = document.createElement('a')
        link.href = url
        link.download = file.name
        document.body.appendChild(link)
        link.click()
        link.remove()
        setTimeout(() => URL.revokeObjectURL(url), 5000)
    })
    try { await navigator.clipboard.writeText(message) } catch { /* sin portapapeles: el mensaje sigue en pantalla */ }
    return 'downloaded'
}

export default shareSlides

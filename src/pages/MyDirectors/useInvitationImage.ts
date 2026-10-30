import { useEffect, useState } from 'react'

import { API_ROUTES } from '@/constants/api'
import HttpService from '@/services/http'

/**
 * Su invitación personalizada (la base de Astra con su foto y su nombre), ya descargada: así «Invítala» la puede mandar
 * en el mismo toque (si se descargara al tocar, el teléfono ya no deja abrir el menú de compartir).
 */
const useInvitationImage = (enabled: boolean) => {
    const [image, setImage] = useState<{ file: File, url: string } | null>(null)

    useEffect(() => {
        if (!enabled) return
        let url = ''
        let cancelado = false
        HttpService.get<Blob>(API_ROUTES.AREA.INVITATION_IMAGE.replace('{format}', '1080x1920'), { responseType: 'blob' })
            .then(blob => {
                if (cancelado || !(blob instanceof Blob) || !blob.size) return
                url = URL.createObjectURL(blob)
                setImage({ file: new File([blob], 'invitacion-eyplease.jpg', { type: 'image/jpeg' }), url })
            })
            .catch(() => { /* sin imagen: se invita con el mensaje y la liga */ })
        return () => { cancelado = true; if (url) URL.revokeObjectURL(url) }
    }, [enabled])

    return image
}

/** Si este teléfono puede mandar la imagen directo a WhatsApp (el menú de compartir con archivos). */
export const puedeCompartirImagen = (file: File | null | undefined): file is File =>
    !!file && typeof navigator !== 'undefined' && !!navigator.canShare && navigator.canShare({ files: [file] })

export default useInvitationImage

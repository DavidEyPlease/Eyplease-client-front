/**
 * Compartir imágenes con su mensaje desde la hoja de compartir del teléfono.
 *
 * En iPhone NO pueden ir juntos: si la hoja recibe archivos y texto, WhatsApp se queda sólo con el texto y las imágenes
 * se pierden (bug de WebKit 251500). Lo reportó una consultora el 12-nov-2026 con su dúo del Buen Fin: «las imágenes no
 * se comparten, sólo el texto». Ahí se comparten las imágenes solas y el mensaje se copia antes, para pegarlo en
 * WhatsApp como pie de foto. En Android van juntos y WhatsApp pone el texto debajo de la imagen.
 */

/** iPhone o iPad (el iPad nuevo se presenta como Mac, pero con pantalla táctil). */
export const isIOS = (): boolean =>
    typeof navigator !== 'undefined'
    && (/iPad|iPhone|iPod/.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1))

/** En este teléfono el mensaje va copiado aparte de las imágenes (iPhone con imágenes). */
export const messageGoesSeparate = (withFiles: boolean): boolean => withFiles && isIOS()

/**
 * Abre la hoja de compartir con las imágenes y el mensaje como este teléfono los acepta. En iPhone copia el mensaje
 * SIN esperar a que termine: las dos cosas tienen que salir del mismo toque, y si se espera al portapapeles el navegador
 * puede ya no dejar abrir la hoja.
 */
export const shareFilesWithMessage = (files: File[], message: string): Promise<void> => {
    if (messageGoesSeparate(files.length > 0)) {
        navigator.clipboard?.writeText(message).catch(() => { /* sin portapapeles: el mensaje sigue en pantalla */ })
        return navigator.share({ files })
    }

    return navigator.share(files.length ? { files, text: message } : { text: message })
}

/** El aviso para iPhone, debajo del botón de compartir. */
export const IOS_SHARE_HINT = 'En iPhone, WhatsApp no deja mandar las imágenes y el texto juntos: el mensaje se copia solo. Pégalo en WhatsApp antes de enviar.'

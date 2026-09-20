const KEY = 'eyplease:shell'

/**
 * El marco nuevo es el de TODAS desde el 20-sep-2026 (lo lanzó David).
 *
 * Antes venía apagado y se encendía por persona con `?nuevo=1`, mientras se construía.
 * Ese interruptor sigue vivo y ahora sirve al revés: **`?nuevo=0` devuelve a una clienta
 * al diseño anterior**, y la elección se recuerda en su navegador. Es la escapatoria si a
 * alguien le estorba algo del rediseño; el menú de su cuenta también la ofrece.
 */
export const isNewShell = (): boolean => {
    try {
        const param = new URLSearchParams(window.location.search).get('nuevo')
        if (param === '1' || param === '0') localStorage.setItem(KEY, param === '1' ? 'new' : 'old')

        const saved = localStorage.getItem(KEY)
        if (saved) return saved === 'new'
    } catch {
        /* Navegación privada o almacenamiento bloqueado: vale el valor por defecto */
    }

    return true
}

export const setNewShell = (on: boolean) => {
    try {
        localStorage.setItem(KEY, on ? 'new' : 'old')
    } catch {
        /* Sin almacenamiento no se recuerda; el cambio vale para esta carga */
    }
    window.location.reload()
}

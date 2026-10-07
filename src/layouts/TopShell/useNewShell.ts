const KEY = 'eyplease:shell'

let limpio = false

/**
 * El marco nuevo es el de TODAS y ya no hay vuelta al anterior (7-oct-2026, lo pidió David:
 * «el nuevo es el que está listo, tiene que cambiarse sí o sí»).
 *
 * Desde el lanzamiento (20-sep-2026) una clienta podía quedarse en el diseño anterior —la fila
 * «Volver al diseño anterior» de su menú o `?nuevo=0`— y la elección se recordaba en su
 * navegador. El diseño anterior no tiene cómo regresar, así que quien lo eligió se quedaba ahí.
 * Esa elección guardada ya no cuenta y se borra.
 *
 * Queda `?nuevo=0` SÓLO para revisar un fallo: vale para esa pestaña y se va al cerrarla
 * (`?nuevo=1` lo quita antes). Si algo falla también con el marco viejo, no es del rediseño.
 */
export const isNewShell = (): boolean => {
    try {
        if (!limpio) {
            localStorage.removeItem(KEY)
            limpio = true
        }

        const param = new URLSearchParams(window.location.search).get('nuevo')
        if (param === '0') sessionStorage.setItem(KEY, 'old')
        if (param === '1') sessionStorage.removeItem(KEY)

        return sessionStorage.getItem(KEY) !== 'old'
    } catch {
        /* Navegación privada o almacenamiento bloqueado: el marco nuevo */
        return true
    }
}

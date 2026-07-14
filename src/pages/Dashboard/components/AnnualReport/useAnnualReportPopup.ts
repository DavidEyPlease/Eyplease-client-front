import { useEffect, useState } from 'react'
import dayjs from 'dayjs'
import { ANNUAL_POPUP_SEEN_KEY } from './constants'

/**
 * Controla el popup de bienvenida del reporte anual: se abre UNA sola vez por año (memoria en
 * localStorage) y solo si está habilitado (junio). `dismiss()` lo marca como visto para que no
 * vuelva a aparecer al volver a la vista.
 */
export const useAnnualReportPopup = (enabled: boolean) => {
    const [open, setOpen] = useState(false)
    const storageKey = `${ANNUAL_POPUP_SEEN_KEY}-${dayjs().year()}`

    useEffect(() => {
        if (!enabled || localStorage.getItem(storageKey)) return
        setOpen(true)
    }, [enabled, storageKey])

    const dismiss = () => {
        localStorage.setItem(storageKey, '1')
        setOpen(false)
    }

    return { open, dismiss }
}

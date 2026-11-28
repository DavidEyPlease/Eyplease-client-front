import AnnualReportBanner from './AnnualReportBanner'
import AnnualReportDialog from './AnnualReportDialog'
import { useAnnualReportPopup } from './useAnnualReportPopup'
import { isAnnualReportAvailable } from './constants'
import { useCompany } from '@/utils/company'

/**
 * Reporte anual en la vista Inicio: solo se muestra en junio (cierre del año).
 * Combina un CTA siempre visible (banner) con un popup de bienvenida que aparece una única vez
 * por año (memoria en localStorage).
 */
const AnnualReport = () => {
    // Sale de los reportes de InTouch (Mary Kay): otra empresa no lo tiene aunque tenga boletín.
    const { can } = useCompany()
    const available = isAnnualReportAvailable() && can('portal')
    const { open, dismiss } = useAnnualReportPopup(available)

    if (!available) return null

    return (
        <>
            <AnnualReportBanner />
            <AnnualReportDialog open={open} onClose={dismiss} />
        </>
    )
}

export default AnnualReport

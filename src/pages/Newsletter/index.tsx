import AnnualReport from '@/pages/Dashboard/components/AnnualReport'
import Newsletter from '@/pages/Dashboard/components/Newsletter'

/**
 * El boletín, en su propia página. En el marco de siempre vive dentro del Inicio; con el marco
 * nuevo el Inicio es el Hoy, así que el generador (el mismo, sin cambios) se muda aquí.
 */
const NewsletterPage = () => (
    <div className="grid gap-y-5">
        {/* Reporte anual (solo en junio) */}
        <AnnualReport />
        <Newsletter />
    </div>
)

export default NewsletterPage

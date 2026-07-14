import { useEffect, useState } from 'react'
import { FileText, Presentation } from 'lucide-react'
import Button from '@/components/common/Button'
import { cn } from '@/lib/utils'
import useAuthStore from '@/store/auth'
import { NewsletterTypes } from '@/interfaces/common'
import { generateAnnualReport } from '@/services/reports/reportGenerator'

type FileType = 'pdf' | 'pptx'

interface Props {
    /** Se llama tras disparar la generación (p. ej. para cerrar el popup). */
    onGenerated?: () => void
    className?: string
}

// Estilos pensados para vivir sobre una superficie con gradiente rosa (banner y popup).
const TYPE_BUTTON_BASE = 'flex-1 rounded-full px-4 py-1.5 text-sm font-semibold transition-colors duration-200'
// flex-1 = cada botón ocupa la mitad de la fila (evita el desborde de dos w-full). El texto/icono
// heredan el text-white del componente Button; el icono usa currentColor.
const FORMAT_BUTTON_CLASS = 'min-w-0 flex-1 justify-center'

/**
 * Selector del reporte anual: elige boletín (unidad/nacional) y dispara la generación en el
 * formato elegido. Las opciones de boletín salen de utilData.newsletters (ya filtradas por los
 * permisos del plan), igual que el boletín mensual: un usuario sin permiso nacional no ve esa
 * opción y, si solo tiene uno, no se muestra el selector. La generación corre en segundo plano.
 */
const AnnualReportGenerator = ({ onGenerated, className }: Props) => {
    const { newsletters } = useAuthStore(state => state.utilData)
    const [reportType, setReportType] = useState<NewsletterTypes>(newsletters[0]?.code ?? NewsletterTypes.UNITY)
    const [generating, setGenerating] = useState<Record<FileType, boolean>>({ pdf: false, pptx: false })

    // Mantiene reportType dentro de los boletines permitidos aunque newsletters cargue tras el
    // montaje o el usuario solo tenga uno (evita generar un tipo sin permiso).
    useEffect(() => {
        if (newsletters.length && !newsletters.some(n => n.code === reportType)) {
            setReportType(newsletters[0].code)
        }
    }, [newsletters, reportType])

    // Deshabilita el botón mientras su reporte se genera (evita doble click). generateAnnualReport
    // resuelve cuando la generación termina, así que el spinner dura toda la operación.
    const handleGenerate = async (fileType: FileType) => {
        if (generating[fileType]) return

        const label = newsletters.find(n => n.code === reportType)?.name ?? ''
        setGenerating(prev => ({ ...prev, [fileType]: true }))
        onGenerated?.()

        try {
            await generateAnnualReport({ reportType, fileType, title: `Reporte Anual · ${label}` })
        } finally {
            setGenerating(prev => ({ ...prev, [fileType]: false }))
        }
    }

    return (
        <div className={cn('flex flex-col gap-3', className)}>
            {newsletters.length > 1 && (
                <div className="flex gap-1 rounded-full bg-white/20 p-1 backdrop-blur-sm">
                    {newsletters.map(newsletter => (
                        <button
                            key={newsletter.code}
                            type="button"
                            onClick={() => setReportType(newsletter.code)}
                            className={cn(
                                TYPE_BUTTON_BASE,
                                reportType === newsletter.code ? 'bg-white text-rose-600 shadow' : 'text-white/90 hover:text-white'
                            )}
                        >
                            {newsletter.name}
                        </button>
                    ))}
                </div>
            )}

            <div className="flex gap-3">
                <Button
                    rounded
                    loading={generating.pdf}
                    className={FORMAT_BUTTON_CLASS}
                    text={<span className="flex items-center justify-center gap-2"><FileText className="size-4" />PDF</span>}
                    onClick={() => handleGenerate('pdf')}
                />
                <Button
                    rounded
                    loading={generating.pptx}
                    className={FORMAT_BUTTON_CLASS}
                    text={<span className="flex items-center justify-center gap-2"><Presentation className="size-4" />Power Point</span>}
                    onClick={() => handleGenerate('pptx')}
                />
            </div>
        </div>
    )
}

export default AnnualReportGenerator

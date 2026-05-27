import { Download, ArrowRight, ExternalLink, FileSpreadsheet, AlertCircle } from "lucide-react"

import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from "@/components/ui/dialog"
import { cn } from "@/lib/utils"

interface Props {
    open: boolean
    onOpenChange: (open: boolean) => void
    onConfirm: () => void
}

const MK_PORTAL_URL = 'https://www.marykayintouch.com.mx'

const REPORTS = [
    'Ventas mensuales personales',
    'Iniciación mensual personal',
    'Círculo Rosa',
    'Cumpleaños',
    'Aniversarios',
]

const STEPS = [
    {
        title: 'Entra a marykayintouch.com.mx',
        body: 'Inicia sesión con tu usuario Mary Kay y tu contraseña personal.',
        reports: null as string[] | null,
    },
    {
        title: 'Descarga estos 5 reportes en Excel',
        body: null,
        reports: REPORTS,
    },
    {
        title: 'Súbelos en Eyplease+ tal como están',
        body: 'Entra a la sección "Reportes" en tu cuenta y arrastra los archivos. Te avisamos cuando estén procesados.',
        reports: null,
    },
]

const ManualReportDialog = ({ open, onOpenChange, onConfirm }: Props) => {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-md p-0 overflow-hidden bg-white border-0 shadow-2xl rounded-3xl font-display">
                <div className="px-6 pt-6 pb-2 bg-eyp-gradient-soft">
                    <div className="flex items-center justify-center mb-3 w-12 h-12 rounded-2xl bg-white shadow-md text-eyp-violet">
                        <Download className="w-6 h-6" />
                    </div>
                    <DialogHeader className="p-0 space-y-1 text-left">
                        <DialogTitle className="text-xl font-extrabold text-eyp-ink font-display">
                            ¿Prefieres hacerlo manual?
                        </DialogTitle>
                        <DialogDescription className="text-sm text-eyp-gray-text">
                            Sigue estos pasos cada mes para que Eyplease+ trabaje con tu unidad.
                        </DialogDescription>
                    </DialogHeader>
                </div>

                <div className="px-6 py-5">
                    <ol className="flex flex-col gap-4">
                        {STEPS.map((step, i) => (
                            <li key={i} className="flex items-start gap-3">
                                <span className="flex items-center justify-center w-7 h-7 text-xs font-bold text-white rounded-full bg-eyp-violet shrink-0">
                                    {i + 1}
                                </span>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-semibold text-eyp-ink">{step.title}</p>
                                    {step.body && (
                                        <p className="mt-0.5 text-xs text-eyp-gray-text">{step.body}</p>
                                    )}
                                    {step.reports && (
                                        <ul className="flex flex-col gap-1.5 mt-2 p-3 rounded-xl bg-eyp-gray-warm/60">
                                            {step.reports.map(name => (
                                                <li key={name} className="flex items-center gap-2 text-xs text-eyp-ink-soft">
                                                    <FileSpreadsheet className="w-3.5 h-3.5 text-eyp-violet shrink-0" />
                                                    <span className="font-medium">{name}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    )}
                                </div>
                            </li>
                        ))}
                    </ol>

                    <div className="flex items-start gap-2 p-3 mt-4 rounded-xl border border-amber-200 bg-amber-50/60">
                        <AlertCircle className="w-4 h-4 mt-0.5 text-amber-700 shrink-0" />
                        <p className="text-xs leading-relaxed text-amber-900">
                            Súbelos <b>tal como vienen de Mary Kay</b> en formato Excel.{' '}
                            No edites ni modifiques nada — necesitamos el archivo original para leerlo correctamente.
                        </p>
                    </div>

                    <a
                        href={MK_PORTAL_URL}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 mt-4 text-xs font-semibold underline text-eyp-violet hover:text-eyp-violet-deep"
                    >
                        Ir a marykayintouch.com.mx
                        <ExternalLink className="w-3 h-3" />
                    </a>
                </div>

                <DialogFooter className="flex-col gap-2 px-6 pb-6 sm:flex-col sm:gap-2 sm:items-stretch">
                    <button
                        type="button"
                        onClick={onConfirm}
                        className={cn(
                            "inline-flex items-center justify-center gap-2 px-6 py-3 text-sm font-semibold text-white rounded-full shadow-lg shadow-eyp-violet/30 transition-all duration-200",
                            "bg-eyp-gradient hover:shadow-xl hover:shadow-eyp-violet/40 hover:-translate-y-0.5"
                        )}
                    >
                        Entendido, lo haré manual
                        <ArrowRight className="w-4 h-4" />
                    </button>
                    <button
                        type="button"
                        onClick={() => onOpenChange(false)}
                        className="text-sm font-medium underline text-eyp-gray-text hover:text-eyp-ink"
                    >
                        Mejor conecto mi cuenta Mary Kay
                    </button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

export default ManualReportDialog

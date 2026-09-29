import { Download, ArrowRight, ExternalLink, FileSpreadsheet, AlertCircle } from "lucide-react"

import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from "@/components/ui/dialog"
import Button from "@/components/common/Button"

interface Props {
    open: boolean
    onOpenChange: (open: boolean) => void
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

const ManualReportDialog = ({ open, onOpenChange }: Props) => {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-md gap-0 overflow-hidden rounded-[26px] border-0 bg-card p-0 shadow-2xl">
                <div className="su-soft border-0 px-6 pt-6 pb-5">
                    <div className="su-accent mb-3 grid size-12 place-items-center rounded-2xl bg-card shadow-md">
                        <Download className="size-6" />
                    </div>
                    <DialogHeader className="space-y-1 p-0 text-left">
                        <DialogTitle className="text-xl font-extrabold tracking-tight">
                            ¿Prefieres hacerlo manual?
                        </DialogTitle>
                        <DialogDescription className="text-sm text-muted-foreground">
                            Sigue estos pasos cada mes para que Eyplease+ trabaje con tu unidad.
                        </DialogDescription>
                    </DialogHeader>
                </div>

                <div className="px-6 py-5">
                    <ol className="flex flex-col gap-4">
                        {STEPS.map((step, i) => (
                            <li key={i} className="flex items-start gap-3">
                                <span className="shell-grad grid size-7 shrink-0 place-items-center rounded-full text-xs font-bold text-white">
                                    {i + 1}
                                </span>
                                <div className="min-w-0 flex-1">
                                    <p className="text-sm font-bold">{step.title}</p>
                                    {step.body && (
                                        <p className="mt-0.5 text-xs text-muted-foreground">{step.body}</p>
                                    )}
                                    {step.reports && (
                                        <ul className="mt-2 flex flex-col gap-1.5 rounded-xl bg-surface-soft p-3 dark:bg-white/[.04]">
                                            {step.reports.map(name => (
                                                <li key={name} className="flex items-center gap-2 text-xs">
                                                    <FileSpreadsheet className="su-accent size-3.5 shrink-0" />
                                                    <span className="font-medium">{name}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    )}
                                </div>
                            </li>
                        ))}
                    </ol>

                    <div className="mt-4 flex items-start gap-2 rounded-xl border border-amber-500/30 bg-amber-500/10 p-3">
                        <AlertCircle className="mt-0.5 size-4 shrink-0 text-amber-600 dark:text-amber-400" />
                        <p className="text-xs leading-relaxed text-amber-900 dark:text-amber-200/90">
                            Súbelos <b>tal como vienen de Mary Kay</b> en formato Excel.{' '}
                            No edites ni modifiques nada: necesitamos el archivo original para leerlo correctamente.
                        </p>
                    </div>

                    <a
                        href={MK_PORTAL_URL}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="su-accent mt-4 inline-flex items-center gap-1.5 text-xs font-bold underline underline-offset-2"
                    >
                        Ir a marykayintouch.com.mx
                        <ExternalLink className="size-3" />
                    </a>
                </div>

                <DialogFooter className="px-6 pb-6">
                    <Button
                        type="button"
                        onClick={() => onOpenChange(false)}
                        rounded
                        size="lg"
                        block
                        className="h-12 justify-center"
                        text={<>Entendido, lo haré manual<ArrowRight className="size-4" /></>}
                    />
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

export default ManualReportDialog

import { useState } from 'react'
import { Download, RotateCcw, X } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { ReportTask } from '@/services/reports/types'
import ReportTaskIcon from './ReportTaskIcon'
import ReportTaskProgress from './ReportTaskProgress'
import { PDF_ROTATING_MESSAGES } from './messages'
import { useRotatingMessage } from './useRotatingMessage'

interface Props {
    task: ReportTask
    onDownload: (task: ReportTask) => void
    onDismiss: (id: string) => void
    onRetry?: (task: ReportTask) => void
}

const TYPE_LABEL: Record<ReportTask['type'], string> = {
    pdf: 'PDF',
    pptx: 'PowerPoint',
}

// Tarjeta individual del centro de tareas. Cambia de estilo y de contenido según
// el estado: durante la generación muestra progreso animado; al terminar se torna
// "éxito" con un botón de descarga; si falla, estilo de error con opción de reintento.
// Importante: NO se puede cerrar mientras genera ni antes de descargar (se perdería
// el archivo); la opción de cerrar solo aparece tras descargar o ante un error.
const ReportTaskCard = ({ task, onDownload, onDismiss, onRetry }: Props) => {
    const [downloaded, setDownloaded] = useState(false)

    const isGenerating = task.status === 'generating'
    const isReady = task.status === 'ready'
    const isError = task.status === 'error'

    // El PDF no expone progreso real: rotamos mensajes mientras se genera.
    const rotatingMessage = useRotatingMessage(
        PDF_ROTATING_MESSAGES,
        isGenerating && task.type === 'pdf'
    )

    const statusLine = isError
        ? task.error || 'Ocurrió un error inesperado.'
        : isReady
            ? downloaded ? '¡Descargado!' : task.statusText
            : isGenerating && task.type === 'pdf'
                ? rotatingMessage
                : task.statusText

    const showPercentage = isGenerating && task.progress !== null

    const handleDownload = () => {
        onDownload(task)
        setDownloaded(true)
    }

    return (
        <div
            className={cn(
                'pointer-events-auto w-80 rounded-2xl border bg-card p-4 shadow-xl ring-1 ring-black/5 transition-colors duration-500',
                'animate-in slide-in-from-bottom-4 fade-in duration-300',
                isReady && 'border-success/40',
                isError && 'border-destructive/40'
            )}
        >
            <div className="flex items-start gap-3">
                <ReportTaskIcon status={task.status} progress={task.progress} />

                <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                        <p className="truncate text-sm font-semibold text-foreground">{task.title}</p>
                        <Badge variant="secondary" className="shrink-0 text-[10px]">
                            {TYPE_LABEL[task.type]}
                        </Badge>
                    </div>
                    <p
                        key={statusLine}
                        className={cn(
                            'mt-0.5 truncate text-xs animate-in fade-in duration-300',
                            isError ? 'text-destructive' : isReady ? 'text-success' : 'text-muted-foreground'
                        )}
                    >
                        {statusLine}
                    </p>
                </div>

                {/* Solo se permite cerrar ante un error (no hay archivo que perder). */}
                {isError && (
                    <Button
                        variant="ghost"
                        size="icon"
                        className="-mr-1 -mt-1 size-7 shrink-0 text-muted-foreground"
                        onClick={() => onDismiss(task.id)}
                        aria-label="Cerrar"
                    >
                        <X className="size-4" />
                    </Button>
                )}
            </div>

            <div key={task.status} className="mt-3 animate-in fade-in duration-300">
                {isGenerating && (
                    <div className="space-y-1.5">
                        <ReportTaskProgress value={task.progress} />
                        {showPercentage && (
                            <p className="text-right text-[11px] font-medium text-muted-foreground">
                                {task.progress}%
                            </p>
                        )}
                    </div>
                )}

                {isReady && (
                    <div className="space-y-2">
                        <Button
                            className="w-full bg-success text-white hover:bg-success/90"
                            onClick={handleDownload}
                        >
                            <Download className="size-4" />
                            {downloaded ? 'Descargar de nuevo' : 'Descargar boletín'}
                        </Button>
                        {/* Cerrar solo tras descargar: ya tiene el archivo a salvo. */}
                        {downloaded && (
                            <Button
                                variant="ghost"
                                className="h-8 w-full text-xs text-muted-foreground animate-in fade-in duration-300"
                                onClick={() => onDismiss(task.id)}
                            >
                                Cerrar
                            </Button>
                        )}
                    </div>
                )}

                {isError && onRetry && (
                    <Button variant="outline" className="w-full" onClick={() => onRetry(task)}>
                        <RotateCcw className="size-4" />
                        Reintentar
                    </Button>
                )}
            </div>
        </div>
    )
}

export default ReportTaskCard

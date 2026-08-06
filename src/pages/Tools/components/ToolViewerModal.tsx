import { useEffect, useState } from 'react'
import { CalendarIcon, ChevronLeftIcon, ChevronRightIcon, LayersIcon, PlayIcon, XIcon } from 'lucide-react'

import Button from '@/components/common/Button'
import IconDownload from '@/components/Svg/IconDownload'
import { Button as UIButton } from '@/components/ui/button'
import { Dialog, DialogClose, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { MAP_TOOLS_SECTIONS } from '@/constants/app'
import useFiles from '@/hooks/useFiles'
import { ITool } from '@/interfaces/tools'
import { cn } from '@/lib/utils'
import { isImage } from '@/utils'
import { formatDate } from '@/utils/dates'
import { buildToolFileName, formatFilesCount, MEDIA_CONTROL_CLASSES, TOOL_SECTION_ICON } from '../utils'
import ToolMedia from './ToolMedia'
import ToolWatermark from './ToolWatermark'

const PILL_CLASSES = 'inline-flex items-center gap-1.5 rounded-full border bg-surface-soft px-2.5 py-1 text-[11px] font-bold text-muted-foreground'

interface Props {
    item: ITool
    lock: boolean
    open: boolean
    initialIndex: number
    onOpenChange: (open: boolean) => void
}

const ToolViewerModal = ({ item, lock, open, initialIndex, onOpenChange }: Props) => {
    const { executing, downloadFile } = useFiles()
    const [index, setIndex] = useState(initialIndex)
    const [downloadingAll, setDownloadingAll] = useState(false)

    const files = item.files
    const file = files[index] ?? files[0]
    const hasManyFiles = files.length > 1
    const SectionIcon = TOOL_SECTION_ICON[item.section]

    /* Al abrir, el visor arranca en el archivo que se estaba viendo en el tile */
    useEffect(() => {
        if (open) setIndex(initialIndex)
    }, [open, initialIndex])

    if (!file) return null

    const goTo = (direction: number) => {
        setIndex(current => (current + direction + files.length) % files.length)
    }

    const onKeyDown = (event: React.KeyboardEvent) => {
        if (!hasManyFiles) return
        if (event.key === 'ArrowLeft') goTo(-1)
        if (event.key === 'ArrowRight') goTo(1)
    }

    const onDownloadCurrent = () => {
        if (lock) return
        downloadFile(file.uri, buildToolFileName(item.title, index, file.ext))
    }

    const onDownloadAll = async () => {
        if (lock) return
        setDownloadingAll(true)
        for (const [fileIndex, itemFile] of files.entries()) {
            await downloadFile(itemFile.uri, buildToolFileName(item.title, fileIndex, itemFile.ext))
        }
        setDownloadingAll(false)
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent
                showCloseButton={false}
                aria-describedby={undefined}
                onKeyDown={onKeyDown}
                className="grid gap-0 overflow-hidden rounded-3xl border-none p-0 shadow-card-hover sm:max-w-4xl lg:grid-cols-[minmax(0,1fr)_300px]"
            >
                {/* Escenario: la pieza completa sobre su propio fondo desenfocado */}
                <div className="relative flex min-h-[420px] items-center justify-center overflow-hidden bg-foreground p-8">
                    {isImage(file.ext) ? (
                        <img src={file.url} alt="" aria-hidden className="absolute inset-0 size-full scale-125 object-cover opacity-50 blur-3xl" />
                    ) : (
                        <video src={file.url} aria-hidden muted playsInline preload="metadata" className="absolute inset-0 size-full scale-125 object-cover opacity-50 blur-3xl" />
                    )}

                    <div className="relative z-10 overflow-hidden rounded-xl shadow-card-hover">
                        <ToolMedia file={file} variant="viewer" />
                        {lock && <ToolWatermark />}
                    </div>

                    <DialogClose className={cn(MEDIA_CONTROL_CLASSES, 'absolute top-3 right-3 z-20')}>
                        <XIcon className="size-4" />
                        <span className="sr-only">Cerrar</span>
                    </DialogClose>

                    {hasManyFiles && (
                        <>
                            <button type="button" aria-label="Archivo anterior" onClick={() => goTo(-1)} className={cn(MEDIA_CONTROL_CLASSES, 'absolute top-1/2 left-3 z-20 -translate-y-1/2')}>
                                <ChevronLeftIcon className="size-4" />
                            </button>
                            <button type="button" aria-label="Archivo siguiente" onClick={() => goTo(1)} className={cn(MEDIA_CONTROL_CLASSES, 'absolute top-1/2 right-3 z-20 -translate-y-1/2')}>
                                <ChevronRightIcon className="size-4" />
                            </button>
                            <span className="absolute bottom-3 left-1/2 z-20 -translate-x-1/2 rounded-full border border-white/20 bg-black/50 px-2.5 py-1 text-[10.5px] font-extrabold text-white backdrop-blur-md">
                                {index + 1}/{files.length}
                            </span>
                        </>
                    )}
                </div>

                <div className="flex min-w-0 flex-col gap-4 overflow-y-auto p-5">
                    <DialogHeader>
                        <DialogTitle className="text-left text-[17px] leading-snug font-extrabold tracking-tight">
                            {item.title}
                        </DialogTitle>
                    </DialogHeader>

                    <div className="flex flex-wrap gap-1.5">
                        <span className={PILL_CLASSES}>
                            <CalendarIcon className="size-3" aria-hidden />
                            {formatDate(item.created_at)}
                        </span>
                        <span className={PILL_CLASSES}>
                            <SectionIcon className="size-3" aria-hidden />
                            {MAP_TOOLS_SECTIONS[item.section]}
                        </span>
                        <span className={PILL_CLASSES}>
                            <LayersIcon className="size-3" aria-hidden />
                            {formatFilesCount(files.length)}
                        </span>
                    </div>

                    <div className="flex flex-col gap-2">
                        <span className="text-[10.5px] font-extrabold tracking-wider text-muted-foreground uppercase">
                            Archivos ({files.length})
                        </span>
                        <div className="flex flex-wrap gap-2">
                            {files.map((thumbFile, thumbIndex) => (
                                <button
                                    key={thumbFile.id}
                                    type="button"
                                    aria-label={`Ver archivo ${thumbIndex + 1}`}
                                    onClick={() => setIndex(thumbIndex)}
                                    className={cn(
                                        'aspect-4/5 w-12 cursor-pointer overflow-hidden rounded-lg border-2 transition-all',
                                        thumbIndex === index
                                            ? 'border-primary shadow-primary-glow'
                                            : 'border-transparent opacity-75 hover:opacity-100',
                                    )}
                                >
                                    {isImage(thumbFile.ext) ? (
                                        <img src={thumbFile.url} alt="" draggable={false} className="pointer-events-none size-full object-cover" />
                                    ) : (
                                        <span className="grid size-full place-content-center bg-foreground text-white">
                                            <PlayIcon className="size-4 fill-current" />
                                        </span>
                                    )}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="mt-auto flex flex-col gap-2 pt-2">
                        <Button
                            block
                            text={<><IconDownload className="size-4.5" />Descargar este archivo</>}
                            size="sm"
                            loading={executing && !downloadingAll}
                            disabled={lock}
                            onClick={onDownloadCurrent}
                        />
                        {hasManyFiles && (
                            <UIButton
                                variant="outline"
                                disabled={lock || downloadingAll || executing}
                                onClick={onDownloadAll}
                                className="h-auto cursor-pointer rounded-brand border-primary/25 py-2.5 text-[13px] font-bold text-primary hover:bg-primary/5 hover:text-primary"
                            >
                                <LayersIcon />
                                {downloadingAll ? 'Descargando…' : `Descargar todos (${files.length})`}
                            </UIButton>
                        )}
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}

export default ToolViewerModal

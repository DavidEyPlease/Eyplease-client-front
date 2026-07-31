import { useState } from 'react'
import { CalendarIcon, DownloadIcon, Maximize2Icon } from 'lucide-react'
import { toast } from 'sonner'

import Modal from '@/components/common/Modal'
import Spinner from '@/components/common/Spinner'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import useFiles from '@/hooks/useFiles'
import { FileTypes } from '@/interfaces/files'
import { ITraining } from '@/interfaces/trainings'
import useAuthStore from '@/store/auth'
import { formatDate } from '@/utils/dates'
import {
    getDownloadableFiles,
    getTrainingFileByType,
    TRAINING_FILE_ICON,
    TRAINING_FILE_NAME,
    TRAINING_FILE_SHORT_NAME,
} from '../utils'

interface Props {
    training: ITraining
    showRibbon?: boolean
    showCategory?: boolean
}

const TrainingItem = ({ training, showRibbon, showCategory }: Props) => {
    const { downloadFile } = useFiles()
    const { utilData } = useAuthStore(state => state)
    const [fileIdDownloading, setFileIdDownloading] = useState('')
    const [showCover, setShowCover] = useState(false)

    const files = getDownloadableFiles(training.files)
    const cover = getTrainingFileByType(training.files, FileTypes.TRAINING_COVER)?.url
    const categoryName = utilData.training_categories.find(category => category.slug === training.category)?.name

    const onDownloadClick = async (fileId: string, fileUri: string) => {
        try {
            setFileIdDownloading(fileId)
            await downloadFile(fileUri)
        } catch (error) {
            console.error(error)
            toast.error('Error al descargar el archivo. Intenta nuevamente.')
        } finally {
            setFileIdDownloading('')
        }
    }

    return (
        <Card className="flex flex-col gap-0 overflow-hidden rounded-[20px] p-0 shadow-card transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/15 hover:shadow-card-hover">
            <div className="relative">
                {/* La portada se recorta a 16:10 en la tarjeta: al pulsarla se abre completa */}
                <button
                    type="button"
                    disabled={!cover}
                    onClick={() => setShowCover(true)}
                    aria-label={`Ver portada de ${training.title}`}
                    className="group/cover block w-full cursor-zoom-in disabled:cursor-default"
                >
                    {cover ? (
                        <img src={cover} alt="" loading="lazy" className="aspect-16/10 w-full object-cover" />
                    ) : (
                        <div className="aspect-16/10 w-full bg-surface-soft" />
                    )}

                    {cover && (
                        <span className="absolute inset-0 grid place-content-center bg-black/25 opacity-0 transition-opacity duration-200 group-hover/cover:opacity-100 group-focus-visible/cover:opacity-100">
                            <span className="grid size-9 place-content-center rounded-full bg-card text-primary shadow-card">
                                <Maximize2Icon className="size-4" />
                            </span>
                        </span>
                    )}
                </button>

                {/* pointer-events-none: los badges no deben tragarse el click de la portada */}
                {showRibbon && (
                    <Badge className="pointer-events-none absolute top-2.5 left-2.5 rounded-full bg-primary-gradient px-2.5 text-[10px] font-extrabold tracking-wide shadow-primary-glow">
                        Nueva
                    </Badge>
                )}
                {showCategory && categoryName && (
                    <Badge className="pointer-events-none absolute top-2.5 right-2.5 rounded-full border border-white/25 bg-black/40 px-2.5 text-[10px] font-extrabold tracking-wide text-white uppercase backdrop-blur-sm">
                        {categoryName}
                    </Badge>
                )}
            </div>

            <div className="flex flex-1 flex-col gap-2.5 p-3.5">
                <h3 className="line-clamp-2 min-h-9 text-sm font-bold leading-snug tracking-tight">
                    {training.title}
                </h3>

                <p className="flex items-center gap-1.5 text-[11.5px] font-semibold text-muted-foreground">
                    <CalendarIcon className="size-3" aria-hidden />
                    {formatDate(training.created_at, { formatter: { date: 'medium' } })}
                    <span aria-hidden>·</span>
                    {files.length} {files.length === 1 ? 'archivo' : 'archivos'}
                </p>

                {!!files.length && (
                    <div className="mt-auto grid grid-cols-2 gap-1.5 border-t border-dashed pt-2.5">
                        {files.map(file => {
                            const fileType = file.type as keyof typeof TRAINING_FILE_SHORT_NAME
                            const Icon = TRAINING_FILE_ICON[file.type]
                            const isDownloading = fileIdDownloading === file.id

                            return (
                                <button
                                    key={file.id}
                                    type="button"
                                    disabled={isDownloading}
                                    title={TRAINING_FILE_NAME[fileType]}
                                    onClick={() => onDownloadClick(file.id, file.uri)}
                                    className="group flex cursor-pointer items-center gap-2 rounded-xl border bg-card px-2.5 py-2 text-left transition-colors hover:border-primary/30 hover:bg-primary/5 disabled:pointer-events-none disabled:opacity-60"
                                >
                                    <span className="grid size-6.5 shrink-0 place-content-center rounded-lg bg-primary/10 text-primary">
                                        {isDownloading
                                            ? <Spinner size="xs" color="primary" className="w-auto" />
                                            : Icon && <Icon className="size-3.5" />}
                                    </span>
                                    <span className="min-w-0 flex-1 truncate text-[11.5px] font-bold tracking-tight">
                                        {TRAINING_FILE_SHORT_NAME[fileType]}
                                    </span>
                                    <DownloadIcon className="size-3 shrink-0 text-primary opacity-30 transition-opacity group-hover:opacity-100" />
                                </button>
                            )
                        })}
                    </div>
                )}
            </div>

            {cover && (
                <Modal open={showCover} onOpenChange={setShowCover} title={training.title} size="xxl">
                    <img src={cover} alt={training.title} className="w-full rounded-xl object-contain" />
                </Modal>
            )}
        </Card>
    )
}

export default TrainingItem

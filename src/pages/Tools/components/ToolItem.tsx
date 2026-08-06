import { useState } from 'react'
import { CalendarIcon, ImageIcon, Maximize2Icon, VideoIcon } from 'lucide-react'

import Button from '@/components/common/Button'
import IconDownload from '@/components/Svg/IconDownload'
import { Badge } from '@/components/ui/badge'
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel'
import useCarousel from '@/hooks/useCarousel'
import useFiles from '@/hooks/useFiles'
import { ITool } from '@/interfaces/tools'
import { cn } from '@/lib/utils'
import { isImage } from '@/utils'
import { formatDate } from '@/utils/dates'
import {
    buildToolFileName,
    clampTileAspect,
    DEFAULT_TILE_ASPECT,
    formatFilesCount,
    isToolNew,
    MEDIA_CONTROL_CLASSES,
} from '../utils'
import ToolMedia from './ToolMedia'
import ToolViewerModal from './ToolViewerModal'
import ToolWatermark from './ToolWatermark'

/* Flechas del carrusel: visibles al pasar el ratón (o siempre, en pantallas táctiles) */
const TILE_ARROW_CLASSES = 'top-1/2 z-50 size-8 -translate-y-1/2 opacity-0 transition-opacity group-hover:opacity-100 focus-visible:opacity-100 pointer-coarse:opacity-100'

interface Props {
    item: ITool
    lock: boolean
}

export const ToolItem = ({ item, lock }: Props) => {
    const { setApi, current } = useCarousel()
    const { executing, downloadFile } = useFiles()
    const [aspectRatio, setAspectRatio] = useState(DEFAULT_TILE_ASPECT)
    const [showViewer, setShowViewer] = useState(false)

    const activeIndex = Math.max(current - 1, 0)
    const activeFile = item.files[activeIndex]
    const hasManyFiles = item.files.length > 1
    const ActiveKindIcon = activeFile && isImage(activeFile.ext) ? ImageIcon : VideoIcon

    /* La primera pieza define la proporción real del tile (el mural respeta las alturas) */
    const onMediaSize = (width: number, height: number) => {
        if (!width || !height) return
        setAspectRatio(clampTileAspect(width / height))
    }

    const onDownloadClick = () => {
        if (lock || !activeFile) return
        downloadFile(activeFile.uri, buildToolFileName(item.title, activeIndex, activeFile.ext))
    }

    return (
        <article className="group relative overflow-hidden rounded-[20px] bg-surface-soft shadow-card transition-all duration-200 hover:-translate-y-0.5 hover:shadow-card-hover">
            {/* loop: las flechas nunca quedan deshabilitadas (el visor también da la vuelta) */}
            <Carousel setApi={setApi} opts={{ loop: true }} className="w-full">
                <CarouselContent className="ml-0">
                    {item.files.map((file, fileIndex) => (
                        <CarouselItem key={file.id} className="pl-0">
                            {/* Estilo inline necesario: la proporción se mide de la propia pieza */}
                            <div className="relative w-full" style={{ aspectRatio }}>
                                <ToolMedia file={file} onMediaSize={fileIndex === 0 ? onMediaSize : undefined} />
                            </div>
                        </CarouselItem>
                    ))}
                </CarouselContent>

                {hasManyFiles && (
                    <>
                        <CarouselPrevious className={cn(MEDIA_CONTROL_CLASSES, TILE_ARROW_CLASSES, 'left-2')} />
                        <CarouselNext className={cn(MEDIA_CONTROL_CLASSES, TILE_ARROW_CLASSES, 'right-2')} />
                    </>
                )}
            </Carousel>

            {/* Abre el visor con la pieza completa (bajo el escudo cuando está bloqueada) */}
            <button
                type="button"
                aria-label={`Ver ${item.title} completa`}
                onClick={() => setShowViewer(true)}
                className="absolute inset-0 z-10 cursor-zoom-in"
            />

            {lock && <ToolWatermark />}

            {isToolNew(item.created_at) && (
                <Badge className="pointer-events-none absolute top-3 left-3 z-40 rounded-full bg-primary-gradient px-2.5 text-[10px] font-extrabold tracking-wide shadow-primary-glow">
                    Nueva
                </Badge>
            )}

            <span className="pointer-events-none absolute top-3 right-3 z-40 inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-black/50 px-2.5 py-1 text-[10.5px] font-extrabold text-white backdrop-blur-md">
                <ActiveKindIcon className="size-3" aria-hidden />
                {activeIndex + 1}/{item.files.length}
            </span>

            {/* Scrim inferior: título y meta sobre la propia pieza */}
            <div className="pointer-events-none absolute inset-x-0 bottom-0 z-40 flex flex-col gap-1.5 bg-gradient-to-t from-black/95 via-black/65 to-transparent px-3.5 pt-14 pb-3 text-white pointer-coarse:pb-14">
                {hasManyFiles && (
                    <div className="flex gap-1">
                        {item.files.map((file, fileIndex) => (
                            <span
                                key={file.id}
                                className={cn(
                                    'h-1 rounded-full bg-white/50 transition-all duration-200',
                                    fileIndex === activeIndex ? 'w-3.5 bg-white' : 'w-1',
                                )}
                            />
                        ))}
                    </div>
                )}
                <h3 className="line-clamp-2 text-[15px] leading-snug font-bold tracking-tight drop-shadow-sm">{item.title}</h3>
                <p className="flex items-center gap-1.5 text-[11px] font-semibold text-white/85">
                    <CalendarIcon className="size-3" aria-hidden />
                    {formatDate(item.created_at)}
                    <span aria-hidden>·</span>
                    {formatFilesCount(item.files.length)}
                </p>
            </div>

            <div className="absolute right-3 bottom-3 z-50 flex translate-y-1 items-center gap-2 opacity-0 transition-all duration-200 group-hover:translate-y-0 group-hover:opacity-100 group-focus-within:translate-y-0 group-focus-within:opacity-100 pointer-coarse:translate-y-0 pointer-coarse:opacity-100">
                <button
                    type="button"
                    title="Ver completa"
                    onClick={() => setShowViewer(true)}
                    className="grid size-8.5 cursor-pointer place-content-center rounded-full border border-white/25 bg-black/55 text-white backdrop-blur-md transition-colors hover:bg-card hover:text-primary"
                >
                    <Maximize2Icon className="size-4" />
                </button>
                <Button
                    text={<><IconDownload className="size-4" />Descargar</>}
                    size="sm"
                    rounded
                    loading={executing}
                    disabled={lock}
                    onClick={onDownloadClick}
                />
            </div>

            <ToolViewerModal
                item={item}
                lock={lock}
                open={showViewer}
                initialIndex={activeIndex}
                onOpenChange={setShowViewer}
            />
        </article>
    )
}

export default ToolItem

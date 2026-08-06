import { PlayIcon } from 'lucide-react'

import { EypleaseFile } from '@/interfaces/files'
import { isImage } from '@/utils'

interface Props {
    file: EypleaseFile
    /** tile: recorte object-cover; viewer: pieza completa con object-contain */
    variant?: 'tile' | 'viewer'
    /** Reporta el tamaño natural de la pieza (define la proporción del tile) */
    onMediaSize?: (width: number, height: number) => void
}

const ToolMedia = ({ file, variant = 'tile', onMediaSize }: Props) => {
    const isTile = variant === 'tile'

    if (isImage(file.ext)) {
        return (
            <img
                src={file.url}
                alt=""
                loading="lazy"
                draggable={false}
                className={isTile ? 'size-full object-cover' : 'max-h-[68vh] w-auto object-contain'}
                onLoad={event => onMediaSize?.(event.currentTarget.naturalWidth, event.currentTarget.naturalHeight)}
            />
        )
    }

    if (isTile) {
        return (
            <div className="relative size-full">
                <video
                    src={file.url}
                    muted
                    playsInline
                    preload="metadata"
                    className="size-full object-cover"
                    onLoadedMetadata={event => onMediaSize?.(event.currentTarget.videoWidth, event.currentTarget.videoHeight)}
                />
                {/* Velo de play: el vídeo se reproduce en el visor, no en el tile */}
                <span className="pointer-events-none absolute inset-0 grid place-content-center bg-black/20">
                    <span className="grid size-11 place-content-center rounded-full bg-card/90 text-foreground shadow-md">
                        <PlayIcon className="size-4.5 fill-current" />
                    </span>
                </span>
            </div>
        )
    }

    return (
        <video src={file.url} controls playsInline preload="metadata" className="max-h-[68vh] w-auto" />
    )
}

export default ToolMedia

import { useCallback, useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { useNavigate } from 'react-router'
import { ChevronLeftIcon, ChevronRightIcon, DownloadIcon, LayersIcon, LibraryBigIcon, PauseIcon, PlayIcon, XIcon } from 'lucide-react'

import { APP_ROUTES } from '@/constants/app'
import useFiles from '@/hooks/useFiles'
import { cn } from '@/lib/utils'
import { buildToolFileName, TOOL_SECTION_ICON } from '@/pages/Tools/utils'
import { useToolsStore } from '@/store/tools'
import { isImage } from '@/utils'
import { NovedadesSection } from '../hooks/useNovedades'

/** Lo que dura una imagen en pantalla. El video dura lo que dure. */
const IMAGE_SECONDS = 6

const GLASS_BUTTON = 'grid size-11 cursor-pointer place-items-center rounded-full bg-white/15 text-white backdrop-blur-md transition-colors hover:bg-white/25'

interface Props {
    sections: NovedadesSection[]
    /** Sección con la que abre */
    startKey: string
    onSeen: (section: NovedadesSection) => void
    onClose: () => void
}

/**
 * Las Novedades, a pantalla completa y pasando solas: una barra por pieza de la sección y, si la
 * pieza trae varios archivos (un carrusel), su barra se llena por tramos. Al acabar una sección
 * sigue con la siguiente, como las historias de cualquier red.
 */
const StoryViewer = ({ sections, startKey, onSeen, onClose }: Props) => {
    const navigate = useNavigate()
    const setToolFilters = useToolsStore(state => state.setFilters)
    const { executing, downloadFile } = useFiles()

    const [sectionIndex, setSectionIndex] = useState(() => Math.max(sections.findIndex(section => section.key === startKey), 0))
    const [itemIndex, setItemIndex] = useState(0)
    const [fileIndex, setFileIndex] = useState(0)
    const [paused, setPaused] = useState(false)
    const [videoSeconds, setVideoSeconds] = useState(0)
    const [downloadingAll, setDownloadingAll] = useState(false)

    const section = sections[sectionIndex]
    const item = section?.items[Math.min(itemIndex, section.items.length - 1)]
    const file = item?.files[Math.min(fileIndex, item.files.length - 1)]
    const isVideo = !!file && !isImage(file.ext)

    useEffect(() => {
        if (section) onSeen(section)
        // Sólo al cambiar de sección: `onSeen` se recrea en cada pintado de quien lo pasa
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [section?.key])

    useEffect(() => setVideoSeconds(0), [file?.id])

    const goToSection = useCallback((index: number, fromEnd = false) => {
        const target = sections[index]
        if (!target) return onClose()
        setSectionIndex(index)
        const lastItem = target.items.length - 1
        setItemIndex(fromEnd ? lastItem : 0)
        setFileIndex(fromEnd ? target.items[lastItem].files.length - 1 : 0)
    }, [sections, onClose])

    const next = useCallback(() => {
        if (!section || !item) return
        if (fileIndex < item.files.length - 1) return setFileIndex(fileIndex + 1)
        if (itemIndex < section.items.length - 1) {
            setItemIndex(itemIndex + 1)
            setFileIndex(0)
            return
        }
        goToSection(sectionIndex + 1)
    }, [section, item, fileIndex, itemIndex, sectionIndex, goToSection])

    const previous = useCallback(() => {
        if (!section) return
        if (fileIndex > 0) return setFileIndex(fileIndex - 1)
        if (itemIndex > 0) {
            setItemIndex(itemIndex - 1)
            setFileIndex(section.items[itemIndex - 1].files.length - 1)
            return
        }
        if (sectionIndex > 0) goToSection(sectionIndex - 1, true)
    }, [section, fileIndex, itemIndex, sectionIndex, goToSection])

    useEffect(() => {
        const onKey = (event: KeyboardEvent) => {
            if (event.key === 'Escape') onClose()
            if (event.key === 'ArrowRight') next()
            if (event.key === 'ArrowLeft') previous()
            if (event.key === ' ') {
                event.preventDefault()
                setPaused(value => !value)
            }
        }
        window.addEventListener('keydown', onKey)
        return () => window.removeEventListener('keydown', onKey)
    }, [next, previous, onClose])

    /* La página de atrás no se mueve mientras el visor está abierto */
    useEffect(() => {
        const before = document.body.style.overflow
        document.body.style.overflow = 'hidden'
        return () => { document.body.style.overflow = before }
    }, [])

    if (!section || !item || !file) return null

    const SectionIcon = TOOL_SECTION_ICON[section.key]
    const files = item.files.length
    const seconds = isVideo ? videoSeconds : IMAGE_SECONDS
    const busy = executing || downloadingAll

    const onDownload = () => downloadFile(file.uri, buildToolFileName(item.title, fileIndex, file.ext))

    const onDownloadAll = async () => {
        setDownloadingAll(true)
        setPaused(true)
        for (const [index, itemFile] of item.files.entries()) {
            await downloadFile(itemFile.uri, buildToolFileName(item.title, index, itemFile.ext))
        }
        setDownloadingAll(false)
    }

    const openLibrary = () => {
        setToolFilters({ section: section.key })
        onClose()
        navigate(APP_ROUTES.TOOLS)
    }

    return createPortal(
        <div className="hoy-viewer fixed inset-0 z-[120] grid place-items-center bg-[rgba(8,7,20,.84)] backdrop-blur-xl" role="dialog" aria-modal="true" aria-label={`Novedades: ${section.label}`}>
            <button type="button" aria-label="Cerrar" onClick={onClose} className={cn(GLASS_BUTTON, 'fixed top-5 right-6 z-10')}>
                <XIcon className="size-[18px]" />
            </button>

            <div className="flex items-center gap-5">
                <button type="button" aria-label="Anterior" onClick={previous} className={cn(GLASS_BUTTON, 'hidden md:grid', sectionIndex === 0 && itemIndex === 0 && fileIndex === 0 && 'invisible')}>
                    <ChevronLeftIcon className="size-5" />
                </button>

                <div
                    key={section.key}
                    className="hoy-viewer-card relative aspect-[9/16] h-[min(88vh,840px)] max-w-[calc(100vw-24px)] overflow-hidden rounded-[26px] bg-[#111] shadow-[0_40px_100px_-30px_#000]"
                    onMouseDown={() => setPaused(true)}
                    onMouseUp={() => setPaused(false)}
                    onMouseLeave={() => setPaused(false)}
                >
                    {/* La pieza, completa sobre su propio fondo desenfocado: las hay 4:5 y 9:16 */}
                    <div key={file.id} className="hoy-slide absolute inset-0">
                        {isVideo ? (
                            <video
                                src={file.url}
                                autoPlay
                                playsInline
                                className="absolute inset-0 size-full object-contain"
                                ref={video => { if (video) { if (paused) video.pause(); else video.play().catch(() => undefined) } }}
                                onLoadedMetadata={event => setVideoSeconds(event.currentTarget.duration || 0)}
                                onEnded={next}
                            />
                        ) : (
                            <>
                                <img src={file.url} alt="" aria-hidden className="absolute inset-0 size-full scale-125 object-cover opacity-60 blur-2xl" />
                                <img src={file.url} alt={item.title} draggable={false} className="absolute inset-0 size-full object-contain" />
                            </>
                        )}
                    </div>

                    <div className="pointer-events-none absolute inset-x-0 top-0 z-[2] h-32 bg-linear-to-b from-black/60 to-transparent" />

                    <div className="absolute inset-x-3 top-3 z-[3] flex gap-1">
                        {section.items.map((entry, index) => (
                            <i
                                key={entry.id}
                                className={cn('hoy-bar h-[3px] flex-1 overflow-hidden rounded-full bg-white/30', index < itemIndex && 'done', index === itemIndex && 'now')}
                                style={index === itemIndex ? {
                                    '--from': `${(fileIndex / files) * 100}%`,
                                    '--to': `${((fileIndex + 1) / files) * 100}%`,
                                    '--dur': `${seconds || 3600}s`,
                                    '--play': paused || !seconds ? 'paused' : 'running',
                                } as React.CSSProperties : undefined}
                            >
                                {/* La clave reinicia la animación en cada archivo */}
                                <b key={index === itemIndex ? file.id : entry.id} onAnimationEnd={index === itemIndex && !isVideo ? next : undefined} />
                            </i>
                        ))}
                    </div>

                    <div className="absolute inset-x-3.5 top-7 z-[3] flex items-center gap-2.5 text-white [text-shadow:0_1px_8px_rgba(0,0,0,.6)]">
                        <span className="shell-grad grid size-9 shrink-0 place-items-center rounded-full">
                            <SectionIcon className="size-4" />
                        </span>
                        <span className="min-w-0 flex-1 leading-tight">
                            <b className="block truncate text-[13px]">{section.label}</b>
                            <small className="block truncate text-[11px] opacity-85">{item.title}{files > 1 ? ` · ${fileIndex + 1} de ${files}` : ''}</small>
                        </span>
                        <button type="button" aria-label={paused ? 'Seguir' : 'Pausar'} onClick={() => setPaused(value => !value)} onMouseDown={event => event.stopPropagation()} onMouseUp={event => event.stopPropagation()} className="grid size-8 cursor-pointer place-items-center rounded-full transition-colors hover:bg-white/15">
                            {paused ? <PlayIcon className="size-4 fill-current" /> : <PauseIcon className="size-4 fill-current" />}
                        </button>
                    </div>

                    {/* Tocar a un lado o al otro, como en el teléfono */}
                    <button type="button" aria-label="Anterior" tabIndex={-1} onClick={previous} className="absolute top-16 bottom-24 left-0 z-[2] w-[38%] cursor-default" />
                    <button type="button" aria-label="Siguiente" tabIndex={-1} onClick={next} className="absolute top-16 right-0 bottom-24 z-[2] w-[38%] cursor-default" />

                    <div
                        className="absolute inset-x-0 bottom-0 z-[3] flex gap-2 bg-linear-to-t from-black/80 to-transparent px-3.5 pt-16 pb-3.5"
                        onMouseDown={event => event.stopPropagation()}
                        onMouseUp={event => event.stopPropagation()}
                    >
                        <button type="button" disabled={busy} onClick={onDownload} className="hoy-cta flex h-11 flex-1 cursor-pointer items-center justify-center gap-2 rounded-[14px] text-[13px] font-bold text-white disabled:opacity-60">
                            <DownloadIcon className="size-4" />
                            {executing && !downloadingAll ? 'Descargando…' : 'Descargar'}
                        </button>
                        {files > 1 && (
                            <button type="button" disabled={busy} title={`Descargar los ${files} archivos`} onClick={onDownloadAll} className="flex h-11 cursor-pointer items-center gap-1.5 rounded-[14px] bg-white/18 px-3.5 text-[12.5px] font-bold text-white backdrop-blur-md transition-colors hover:bg-white/28 disabled:opacity-60">
                                <LayersIcon className="size-4" />
                                {downloadingAll ? '…' : files}
                            </button>
                        )}
                        <button type="button" title="Abrir esta sección en la biblioteca" onClick={openLibrary} className="grid size-11 shrink-0 cursor-pointer place-items-center rounded-[14px] bg-white/18 text-white backdrop-blur-md transition-colors hover:bg-white/28">
                            <LibraryBigIcon className="size-[18px]" />
                        </button>
                    </div>
                </div>

                <button type="button" aria-label="Siguiente" onClick={next} className={cn(GLASS_BUTTON, 'hidden md:grid')}>
                    <ChevronRightIcon className="size-5" />
                </button>
            </div>
        </div>,
        document.body,
    )
}

export default StoryViewer

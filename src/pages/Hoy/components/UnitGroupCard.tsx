import { useState } from 'react'
import { CameraIcon, CheckIcon, ChevronLeftIcon, ChevronRightIcon, DownloadIcon, HeartIcon, RefreshCwIcon } from 'lucide-react'
import { toast } from 'sonner'

import { IconBySection } from '@/components/generics/IconBySection'
import useFiles from '@/hooks/useFiles'
import { NewsletterSectionKeys } from '@/interfaces/common'
import { PermissionKeys } from '@/interfaces/permissions'
import { IPost, PostTypes } from '@/interfaces/posts'
import { cn } from '@/lib/utils'
import RegeneratePhotoDialog from '@/pages/Posts/components/PostsTray/RegeneratePhotoDialog'
import usePostActions from '@/pages/Posts/hooks/usePostActions'
import {
    canMarkPostAsSent, getAvailableMediaTypes, getPostMedia, getPostMediaFile, isPostRegenerating, isPostSent,
    MEDIA_TYPE_LABELS, MEDIA_TYPE_ORDER, POST_MEDIA_TYPES, PostMediaType, PostVersionGroup,
} from '@/pages/Posts/lib'
import { UnitGroup } from '../hooks/useUnitToday'
import { titleCaseName } from '../lib'

/** Con más piezas que esto los puntos no caben: se cambia a contador. */
const MAX_DOTS = 12

const TAG = 'inline-flex h-[22px] shrink-0 items-center gap-1.5 rounded-full px-2.5 text-[10.5px] font-bold tracking-wide whitespace-nowrap'
const GHOST = 'flex h-8 cursor-pointer items-center gap-1.5 rounded-[11px] bg-foreground/5 px-3 text-[12px] font-bold transition-colors hover:bg-foreground/10 disabled:cursor-default disabled:opacity-50 [&_svg]:size-[15px]'
const ARROW = 'hoy-arrow absolute top-1/2 z-[3] grid size-[38px] -translate-y-1/2 cursor-pointer place-items-center rounded-full bg-white/85 text-[#1A1830] shadow-[0_6px_18px_-6px_rgba(0,0,0,.5)]'

const whenLabel = (group: UnitGroup) => {
    if (group.isToday) return 'Hoy'
    const diff = Math.round((Date.now() - new Date(`${group.day}T12:00:00`).getTime()) / 86_400_000)
    if (diff === 1) return 'Ayer'
    if (diff > 1 && diff < 7) return `Hace ${diff} días`
    return new Date(`${group.day}T12:00:00`).toLocaleDateString('es-MX', { day: 'numeric', month: 'long' })
}

const personName = (post: IPost) => titleCaseName(post.vendorable?.name ?? post.title ?? '')

interface Props {
    group: UnitGroup
    patchPost: (itemId: string, data: Partial<IPost>) => void
    index?: number
}

/**
 * Tarjeta del feed: la pieza llena la tarjeta y se pasa de una consultora a otra con las
 * flechas; debajo van los formatos y las acciones, que aplican a la que se está viendo.
 *
 * Las acciones son LAS MISMAS de Publicaciones (`usePostActions`): descargar marca como
 * enviada con «Deshacer», rehacer reencola el render y sin foto primero se pide la foto.
 */
const UnitGroupCard = ({ group, patchPost, index = 0 }: Props) => {
    const { markAsSentOnDownload, markManyAsSent, regenerate } = usePostActions({ patchPost })
    const { downloadFile } = useFiles()

    const [position, setPosition] = useState(0)
    const [format, setFormat] = useState<PostMediaType>(POST_MEDIA_TYPES.IMAGE)
    const [versionByPiece, setVersionByPiece] = useState<Record<string, string>>({})
    const [busy, setBusy] = useState<'one' | 'all' | null>(null)
    const [heart, setHeart] = useState(0)
    /* La persona se conserva al cerrar para que el diálogo se despida con su animación */
    const [photoFor, setPhotoFor] = useState<IPost | null>(null)
    const [photoOpen, setPhotoOpen] = useState(false)

    /* Versión elegida en cada pieza (Círculo Rosa: con o sin el producto). Por defecto, la A. */
    const versionOf = (piece: PostVersionGroup): IPost =>
        piece.versions.find(version => version.id === versionByPiece[piece.key]) ?? piece.versions[0]

    const total = group.pieces.length
    const current = Math.min(position, total - 1)
    const piece = group.pieces[current]
    const post = versionOf(piece)
    const media = getPostMedia(post)
    const available = getAvailableMediaTypes(media)
    /* Si la pieza que se ve no tiene el formato elegido, se enseña el primero que sí tenga */
    const activeFormat = available.includes(format) ? format : available[0] ?? POST_MEDIA_TYPES.IMAGE
    const activeFile = getPostMediaFile(media, activeFormat)
    const poster = media.image ?? media.imageSquare

    const regenerating = isPostRegenerating(post)
    const sent = isPostSent(post)
    const hasPerson = !!post.vendorable && post.type !== PostTypes.EYPLEASE_CLIENTS
    const needsPhoto = post.has_photo === false && hasPerson
    /* Pieza de un reto (sección Retos): la hizo el estudio como pedido de diseño, no el render */
    const isChallengePiece = post.newsletter_section?.sectionKey === NewsletterSectionKeys.CHALLENGES

    const go = (step: number) => setPosition((current + step + total) % total)

    const onDownload = async () => {
        if (!activeFile || regenerating || busy) return
        setBusy('one')
        const arrived = await downloadFile(activeFile.uri)
        setBusy(null)
        /* Sólo se marca si el archivo llegó de verdad: un fallo de descarga no es un envío */
        if (!arrived) return
        setHeart(value => value + 1)
        await markAsSentOnDownload(post)
    }

    /* Todas de una vez, para mandarlas juntas al grupo de la unidad */
    const allPosts = group.pieces.map(versionOf).filter(item => !isPostRegenerating(item))

    const onDownloadAll = async () => {
        if (busy) return
        setBusy('all')
        const arrived: IPost[] = []
        for (const item of allPosts) {
            const itemMedia = getPostMedia(item)
            const file = getPostMediaFile(itemMedia, activeFormat) ?? itemMedia.image ?? item.files[0]
            if (file && await downloadFile(file.uri)) arrived.push(item)
        }
        setBusy(null)
        if (!arrived.length) return

        setHeart(value => value + 1)
        const pending = arrived.filter(item => canMarkPostAsSent(item) && !isPostSent(item))
        if (pending.length) await markManyAsSent(pending.map(item => item.id))
        else toast.success(`${arrived.length} ${arrived.length === 1 ? 'pieza descargada' : 'piezas descargadas'}`)
    }

    const askPhoto = (target: IPost) => {
        setPhotoFor(target)
        setPhotoOpen(true)
    }

    /* Sin foto propia rehacer devolvería la misma pieza: primero se pide la foto */
    const onRegenerate = () => needsPhoto ? askPhoto(post) : regenerate(post.id, activeFormat)

    const onPhotoUploaded = () => {
        if (!photoFor) return
        patchPost(photoFor.id, { has_photo: true })
        regenerate(photoFor.id, activeFormat)
    }

    const showVideo = activeFormat === POST_MEDIA_TYPES.VIDEO && !!media.video

    return (
        <article className="shell-glass hoy-rise overflow-hidden rounded-[22px]" style={{ '--i': index } as React.CSSProperties}>
            <header className="flex items-center gap-2.5 px-4 py-3.5">
                <span className="hoy-soft grid size-[38px] shrink-0 place-items-center rounded-[13px] text-primary [&_svg]:size-[18px]">
                    <IconBySection sectionKey={group.key as PermissionKeys} />
                </span>
                <span className="min-w-0 flex-1 leading-tight">
                    <b className="block truncate text-[14px] font-extrabold">{group.label}</b>
                    <small className="text-[11.5px] text-muted-foreground">
                        {whenLabel(group)} · {total} {total === 1 ? 'pieza' : 'piezas'}
                        {group.shared > 0 && ` · ${group.shared} ${group.shared === 1 ? 'enviada' : 'enviadas'}`}
                    </small>
                </span>
                {group.stage === 'live'
                    ? <span className={cn(TAG, 'hoy-live bg-[#E5077D]/12 text-[#E5077D]')}>En vivo</span>
                    : <span className={cn(TAG, 'bg-foreground/5 text-muted-foreground')}>Cierre{group.month ? ` de ${group.month}` : ' de mes'}</span>}
                {group.withoutPhoto > 0 && (
                    <span className={cn(TAG, 'bg-amber-500/15 text-amber-700 dark:text-amber-400')}>{group.withoutPhoto} sin foto</span>
                )}
            </header>

            {/* Doble clic sobre la pieza = descargarla, con el corazón de las redes: el gesto que ya conocen */}
            <div
                className={cn('relative overflow-hidden bg-[#0d0c1d] select-none', activeFormat === POST_MEDIA_TYPES.IMAGE_SQUARE ? 'aspect-square' : 'aspect-4/5')}
                onDoubleClick={showVideo ? undefined : onDownload}
            >
                {showVideo ? (
                    <>
                        {poster && <img src={poster.url} alt="" aria-hidden className="absolute inset-0 size-full scale-110 object-cover opacity-70 blur-xl" />}
                        <video key={media.video!.id} src={media.video!.url} controls playsInline poster={poster?.url} className="hoy-piece absolute inset-0 size-full object-contain" />
                    </>
                ) : activeFile && (
                    <img key={activeFile.id} src={activeFile.url} alt={post.title} loading="lazy" draggable={false} className="hoy-piece absolute inset-0 size-full object-cover object-top" />
                )}

                {!showVideo && (
                    <div className="pointer-events-none absolute inset-x-0 bottom-0 z-[1] bg-linear-to-t from-black/75 to-transparent px-4 pt-16 pb-3.5 text-white [text-shadow:0_2px_12px_rgba(0,0,0,.7)]">
                        <b className="block text-[16px] font-extrabold tracking-tight">{personName(post)}</b>
                        {post.vendorable && <small className="text-[12px] opacity-85">{post.title}</small>}
                    </div>
                )}

                {sent && !regenerating && (
                    <span className={cn(TAG, 'absolute top-3 left-3 z-[3] bg-emerald-50 text-emerald-700')}><CheckIcon className="size-3" /> Enviada</span>
                )}

                {total > 1 && (
                    <>
                        <span className="absolute top-3 right-3 z-[3] h-6 rounded-full bg-black/50 px-2.5 text-[11px] leading-6 font-bold text-white tabular-nums backdrop-blur-md">{current + 1} / {total}</span>
                        <button type="button" aria-label="Pieza anterior" onClick={() => go(-1)} onDoubleClick={event => event.stopPropagation()} className={cn(ARROW, 'left-3')}><ChevronLeftIcon className="size-4" /></button>
                        <button type="button" aria-label="Pieza siguiente" onClick={() => go(1)} onDoubleClick={event => event.stopPropagation()} className={cn(ARROW, 'right-3')}><ChevronRightIcon className="size-4" /></button>
                    </>
                )}

                {needsPhoto && !regenerating && !showVideo && (
                    <div className="absolute inset-0 z-[2] grid place-items-center bg-[rgba(13,12,29,.55)] text-center text-white backdrop-blur-[3px]" onDoubleClick={event => event.stopPropagation()}>
                        <div>
                            <b className="mb-2 block text-[14px]">Falta su foto</b>
                            <button type="button" onClick={() => askPhoto(post)} className="hoy-cta inline-flex h-8 cursor-pointer items-center gap-1.5 rounded-[11px] px-3 text-[12px] font-bold text-white">
                                <CameraIcon className="size-[15px]" /> Cargar foto
                            </button>
                        </div>
                    </div>
                )}

                {regenerating && (
                    <div className="absolute inset-0 z-[4] flex flex-col items-center justify-center gap-2.5 bg-black/60 text-center text-white backdrop-blur-sm">
                        <span className="size-7 animate-spin rounded-full border-[3px] border-white/30 border-t-white" />
                        <span className="text-[12.5px] font-semibold">Generando nuevo diseño…</span>
                    </div>
                )}

                {heart > 0 && (
                    <div key={heart} className="hoy-heart pointer-events-none absolute inset-0 z-[5] grid place-items-center"><HeartIcon /></div>
                )}
            </div>

            {total > 1 && total <= MAX_DOTS && (
                <div className="flex justify-center gap-[5px] pt-2.5">
                    {group.pieces.map((slide, i) => (
                        <button key={slide.key} type="button" aria-label={`Ir a la pieza ${i + 1}`} onClick={() => setPosition(i)} className={cn('h-1.5 cursor-pointer rounded-full transition-all duration-300', i === current ? 'w-[18px] bg-[#6C47FF]' : 'w-1.5 bg-foreground/12')} />
                    ))}
                </div>
            )}

            <footer className="grid gap-3 px-4 pt-2.5 pb-4">
                {piece.versions.length > 1 && (
                    <div>
                        <p className="mb-1 text-[10px] font-bold tracking-wider text-muted-foreground uppercase">Dos versiones de esta pieza · elige una</p>
                        <div className="flex gap-0.5 rounded-xl bg-foreground/5 p-[3px]">
                            {piece.versions.map(version => (
                                <button
                                    key={version.id}
                                    type="button"
                                    onClick={() => setVersionByPiece(previous => ({ ...previous, [piece.key]: version.id }))}
                                    className={cn('min-w-0 flex-1 cursor-pointer truncate rounded-[9px] px-2.5 py-1.5 text-[11.5px] font-bold transition-colors', version.id === post.id ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground')}
                                >
                                    {version.version_label ?? `Versión ${(version.version_key ?? '').toUpperCase()}`}
                                    {isPostSent(version) ? ' ✓' : ''}
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                <div className="flex flex-wrap items-center justify-between gap-2.5">
                    <div className="inline-flex rounded-xl bg-foreground/5 p-[3px]">
                        {MEDIA_TYPE_ORDER.map(type => (
                            <button
                                key={type}
                                type="button"
                                disabled={!available.includes(type)}
                                onClick={() => setFormat(type)}
                                className={cn('h-7 cursor-pointer rounded-[9px] px-[11px] text-[11.5px] font-bold transition-colors disabled:cursor-default disabled:opacity-40', activeFormat === type ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground enabled:hover:text-foreground')}
                            >
                                {MEDIA_TYPE_LABELS[type]}
                            </button>
                        ))}
                    </div>

                    {/* Las piezas de retos no salen del render: se piden como pedido de diseño, así que aquí no se rehacen */}
                    {!isChallengePiece && <div className="flex gap-2">
                        <button type="button" disabled={regenerating} onClick={onRegenerate} className={GHOST}>
                            <RefreshCwIcon className={cn(regenerating && 'animate-spin')} /> Rehacer
                        </button>
                        {hasPerson && (
                            <button type="button" disabled={regenerating} onClick={() => askPhoto(post)} className={cn(GHOST, needsPhoto && 'bg-amber-500/15 text-amber-700 hover:bg-amber-500/25 dark:text-amber-400')}>
                                <CameraIcon /> Foto
                            </button>
                        )}
                    </div>}
                </div>

                <button
                    type="button"
                    disabled={!activeFile || regenerating || !!busy}
                    onClick={onDownload}
                    className={cn(
                        'flex h-[42px] w-full cursor-pointer items-center justify-center gap-2 rounded-[13px] text-[13px] font-bold disabled:cursor-default disabled:opacity-60',
                        sent ? 'bg-emerald-500/14 text-emerald-700 transition-colors hover:bg-emerald-500/22 dark:text-emerald-400' : 'hoy-cta text-white',
                    )}
                >
                    {sent ? <CheckIcon className="size-4" /> : <DownloadIcon className="size-4" />}
                    {busy === 'one' ? 'Descargando…' : sent ? 'Enviada · descargar otra vez' : 'Descargar para compartir'}
                </button>

                {total > 1 && (
                    <button type="button" disabled={!!busy} onClick={onDownloadAll} className="-mt-1 flex h-10 w-full cursor-pointer items-center justify-center gap-2 rounded-[13px] border-[1.5px] border-primary/20 text-[12.5px] font-bold text-primary transition-colors hover:bg-primary/5 disabled:cursor-default disabled:opacity-60">
                        {busy === 'all' ? 'Descargando las piezas…' : `Descargar las ${allPosts.length} de una vez`}
                    </button>
                )}
            </footer>

            {photoFor?.vendorable && (
                <RegeneratePhotoDialog
                    open={photoOpen}
                    person={photoFor.vendorable}
                    replacing={photoFor.has_photo !== false}
                    onUploaded={onPhotoUploaded}
                    onOpenChange={setPhotoOpen}
                />
            )}
        </article>
    )
}

export default UnitGroupCard

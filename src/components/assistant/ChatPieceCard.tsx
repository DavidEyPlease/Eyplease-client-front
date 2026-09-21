import { useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { CheckIcon, DownloadIcon, Loader2Icon, RadioIcon, RefreshCwIcon } from 'lucide-react'
import { toast } from 'sonner'

import { API_ROUTES } from '@/constants/api'
import useFiles from '@/hooks/useFiles'
import useRequestQuery from '@/hooks/useRequestQuery'
import { IChatPiece, IChatPieceFile } from '@/interfaces/chat'
import { cn } from '@/lib/utils'
import { HOY_POSTS_KEY } from '@/pages/Hoy/hooks/useSectionPosts'
import { queryKeys } from '@/utils/cache'

/** Proporción de la miniatura según el formato: la vertical es 9:16, la cuadrada 1:1 */
const THUMB: Record<IChatPieceFile['artifact'], string> = {
	image: 'w-[92px] aspect-[9/16]',
	image_square: 'w-[112px] aspect-square',
	video: 'w-[92px] aspect-[9/16]',
}

/**
 * Una pieza que el Asistente le enseñó en el chat («¿me compartes la de Ana?»).
 *
 * Descargar se comporta como en Publicaciones: la pieza sale hacia su gente, así que se marca
 * enviada sola, con «Deshacer» por si sólo quería mirarla (usePostActions.markAsSentOnDownload).
 */
const ChatPieceCard = ({ piece }: { piece: IChatPiece }) => {
	const queryClient = useQueryClient()
	const { executing: downloading, downloadFile } = useFiles()
	const [format, setFormat] = useState(piece.files[0]?.artifact ?? 'image')
	const [sharedAt, setSharedAt] = useState<string | null>(piece.shared_at)

	/* Marcar o desmarcar mueve también las cuentas de Hoy, Publicaciones y el seguimiento de unidad */
	const { request } = useRequestQuery({
		invalidateQueries: [queryKeys.entity('posts'), queryKeys.entity('posts-stats'), queryKeys.entity('posts-coverage')],
		onError: () => { },
	})

	const file = piece.files.find(item => item.artifact === format) ?? piece.files[0]
	const sentUrl = API_ROUTES.POSTS.MARK_AS_SENT.replace('{id}', piece.id)

	const refreshHoy = () => queryClient.invalidateQueries({ queryKey: HOY_POSTS_KEY })

	const unmark = async () => {
		setSharedAt(null)
		try {
			await request('DELETE', sentUrl)
			refreshHoy()
		} catch {
			setSharedAt(new Date().toISOString())
			toast.error('No se pudo quitar la marca de enviada')
		}
	}

	const onDownload = async () => {
		if (!file) return
		const name = `${[piece.section, piece.person].filter(Boolean).join(' - ')}.${file.ext}`
		if (!(await downloadFile(file.uri, name))) return
		if (!piece.can_mark_sent || sharedAt) return

		setSharedAt(new Date().toISOString())
		try {
			await request('PATCH', sentUrl)
			refreshHoy()
			toast.success('Marcada como enviada', { action: { label: 'Deshacer', onClick: unmark } })
		} catch {
			setSharedAt(null)
		}
	}

	if (!file) return null

	return (
		<div className="flex gap-3 rounded-2xl border border-border bg-background p-2.5">
			<a
				href={file.url}
				target="_blank"
				rel="noreferrer"
				title="Verla completa"
				className={cn('relative shrink-0 self-start overflow-hidden rounded-xl bg-surface-soft', THUMB[file.artifact])}
			>
				{file.artifact === 'video'
					? <video src={file.url} muted playsInline preload="metadata" className="size-full object-cover" />
					: <img src={file.url} alt={piece.title} loading="lazy" className="size-full object-cover" />}
				{piece.is_regenerating && (
					<span className="absolute inset-0 grid place-content-center bg-background/70">
						<RefreshCwIcon className="size-5 animate-spin text-primary" />
					</span>
				)}
			</a>

			<div className="flex min-w-0 flex-1 flex-col gap-1.5">
				<div className="min-w-0">
					<small className="block truncate text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">{piece.section}</small>
					{piece.person && <b className="block truncate text-[13px] font-bold text-foreground">{piece.person}</b>}
				</div>

				<div className="flex flex-wrap gap-1">
					{piece.live && (
						<span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-[10.5px] font-semibold text-primary">
							<RadioIcon className="size-3" /> En vivo
						</span>
					)}
					{piece.is_regenerating && (
						<span className="rounded-full bg-amber-500/10 px-2 py-0.5 text-[10.5px] font-semibold text-amber-600">Rehaciéndose</span>
					)}
					{sharedAt && (
						<span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10.5px] font-semibold text-emerald-600">
							<CheckIcon className="size-3" /> Enviada
						</span>
					)}
				</div>

				{piece.files.length > 1 && (
					<div className="flex flex-wrap gap-1">
						{piece.files.map(item => (
							<button
								key={item.artifact}
								type="button"
								onClick={() => setFormat(item.artifact)}
								className={cn(
									'cursor-pointer rounded-full border px-2 py-0.5 text-[10.5px] font-semibold transition-colors',
									item.artifact === file.artifact ? 'border-primary bg-primary text-white' : 'border-border text-muted-foreground hover:text-foreground',
								)}
							>
								{item.label}
							</button>
						))}
					</div>
				)}

				<button
					type="button"
					onClick={onDownload}
					disabled={downloading || piece.is_regenerating}
					className="mt-auto inline-flex w-fit cursor-pointer items-center gap-1.5 rounded-lg bg-primary-gradient px-3 py-1.5 text-[12px] font-semibold text-white transition-opacity hover:opacity-90 disabled:cursor-default disabled:opacity-60"
				>
					{downloading ? <Loader2Icon className="size-3.5 animate-spin" /> : <DownloadIcon className="size-3.5" />}
					Descargar
				</button>
			</div>
		</div>
	)
}

export default ChatPieceCard

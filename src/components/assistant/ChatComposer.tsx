import { useRef, useState } from 'react'
import { FileIcon, PaperclipIcon, XIcon } from 'lucide-react'

import IconSend from '@/components/Svg/IconSend'
import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/lib/utils'
import useChatAttachments, { MAX_CHAT_FILES } from './useChatAttachments'
import { ChatSendExtras } from './useAssistantChat'

interface Props {
	sending: boolean
	onSend: (text: string, extras?: ChatSendExtras) => Promise<boolean>
	placeholder?: string
	/** Adjuntar fotos y archivos. Apagado por defecto: el chat de la página de Servicios sigue como estaba */
	allowAttachments?: boolean
}

const ChatComposer = ({ sending, onSend, placeholder = 'Pregunta por tus servicios…', allowAttachments = false }: Props) => {
	const [text, setText] = useState('')
	const [dragging, setDragging] = useState(false)
	const input = useRef<HTMLTextAreaElement>(null)
	const picker = useRef<HTMLInputElement>(null)
	const files = useChatAttachments()

	const canSend = (!!text.trim() || files.ready.length > 0) && !sending && !files.uploading

	const submit = async () => {
		if (!canSend) return
		const value = text.trim()
		const sentFiles = files.ready

		setText('')
		files.clear()
		/* Mandar con el botón se lleva el foco al botón: vuelve al cuadro para seguir escribiendo */
		input.current?.focus()

		const sent = await onSend(value, {
			attachments: sentFiles.map(({ fileUri, name, extension, previewUri }) => ({ fileUri, name, extension, previewUri })),
			images: sentFiles.map(item => item.localUrl).filter((url): url is string => !!url),
		})

		/* Si el envío falla, el texto vuelve al input para reintentar (los archivos ya están subidos: se vuelven a elegir) */
		if (!sent) setText(value)
	}

	const onKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
		if (event.key !== 'Enter' || event.shiftKey) return
		event.preventDefault()
		submit()
	}

	/* Pegar una captura o una foto copiada, como en cualquier chat */
	const onPaste = (event: React.ClipboardEvent<HTMLTextAreaElement>) => {
		if (!allowAttachments) return
		const pasted = [...event.clipboardData.files]
		if (!pasted.length) return
		event.preventDefault()
		files.add(pasted)
	}

	const onDrop = (event: React.DragEvent) => {
		if (!allowAttachments) return
		event.preventDefault()
		setDragging(false)
		files.add([...event.dataTransfer.files])
	}

	return (
		<div
			className={cn('border-t border-border p-3 transition-colors', dragging && 'bg-primary/5')}
			onDragOver={event => { if (allowAttachments) { event.preventDefault(); setDragging(true) } }}
			onDragLeave={() => setDragging(false)}
			onDrop={onDrop}
		>
			{files.items.length > 0 && (
				<ul className="mb-2 flex flex-wrap gap-2">
					{files.items.map(item => (
						<li key={item.id} className={cn('relative flex h-14 items-center gap-2 overflow-hidden rounded-xl border bg-card/70 pr-7', item.status === 'error' && 'border-red-400/60')}>
							{item.localUrl
								? <img src={item.localUrl} alt="" className={cn('size-14 object-cover', item.status === 'uploading' && 'opacity-50')} />
								: <span className="grid size-14 place-items-center bg-primary/8 text-primary"><FileIcon className="size-5" /></span>}
							<span className="max-w-28 min-w-0 leading-tight">
								<b className="block truncate text-[11.5px] font-semibold">{item.name}</b>
								<small className="text-[10.5px] text-muted-foreground">{item.status === 'uploading' ? 'Subiendo…' : item.status === 'error' ? 'No se subió' : 'Listo'}</small>
							</span>
							<button type="button" aria-label={`Quitar ${item.name}`} onClick={() => files.remove(item.id)} className="absolute top-1 right-1 grid size-5 cursor-pointer place-items-center rounded-full bg-foreground/10 hover:bg-foreground/20">
								<XIcon className="size-3" />
							</button>
						</li>
					))}
				</ul>
			)}

			<div className="flex items-end gap-2">
				{allowAttachments && (
					<>
						<button
							type="button"
							title="Adjuntar fotos o archivos (también puedes pegarlos o arrastrarlos)"
							aria-label="Adjuntar fotos o archivos"
							disabled={files.items.length >= MAX_CHAT_FILES}
							onClick={() => picker.current?.click()}
							className="grid size-11 shrink-0 cursor-pointer place-content-center rounded-full text-muted-foreground transition-colors hover:bg-foreground/5 hover:text-primary disabled:pointer-events-none disabled:opacity-40"
						>
							<PaperclipIcon className="size-[18px]" />
						</button>
						{/* Se limpia tras elegir para poder volver a elegir el mismo archivo */}
						<input
							ref={picker}
							type="file"
							multiple
							accept="image/*,application/pdf"
							className="hidden"
							onChange={event => {
								files.add([...(event.target.files ?? [])])
								event.target.value = ''
								input.current?.focus()
							}}
						/>
					</>
				)}
				<Textarea
					ref={input}
					rows={1}
					value={text}
					placeholder={placeholder}
					className="max-h-36 min-h-11 flex-1 resize-none"
					/* NO se apaga mientras responde: un cuadro apagado suelta el foco y, al volver, había que
					   darle clic otra vez para seguir escribiendo. Así puede ir escribiendo lo siguiente; lo
					   que se frena mientras tanto es el ENVÍO (Enter y el botón), no el teclado. */
					onChange={event => setText(event.target.value)}
					onKeyDown={onKeyDown}
					onPaste={onPaste}
				/>
				<button
					className="grid size-11 shrink-0 cursor-pointer place-content-center rounded-full bg-primary-gradient text-white shadow-primary-glow transition hover:brightness-[1.03] active:scale-95 disabled:pointer-events-none disabled:opacity-50 disabled:shadow-none"
					disabled={!canSend}
					aria-label="Enviar mensaje"
					onClick={submit}
				>
					<IconSend />
				</button>
			</div>
			<p className="mt-1.5 hidden px-1 text-[10.5px] font-medium text-muted-foreground sm:block">
				Enter envía · Shift + Enter salto de línea{allowAttachments ? ' · pega o arrastra una foto para adjuntarla' : ''}
			</p>
		</div>
	)
}

export default ChatComposer

import { PaperclipIcon, SparklesIcon } from 'lucide-react'

import { IChatMessage } from '@/interfaces/chat'
import { cn } from '@/lib/utils'
import ChatRichText from './ChatRichText'

/** Avatar del asistente: círculo con el gradiente de marca */
export const AssistantAvatar = ({ className }: { className?: string }) => (
	<span className={cn('grid size-8 shrink-0 place-content-center rounded-full bg-primary-gradient text-white shadow-primary-glow', className)}>
		<SparklesIcon className="size-4" />
	</span>
)

const ChatMessageBubble = ({ message }: { message: IChatMessage }) => {
	const isUser = message.role === 'user'

	if (isUser) {
		/* Lo que acaba de mandar se ve en miniatura; lo que viene del historial, por su nombre
		   (las fotos viven en su carpeta privada y no se vuelven a bajar sólo para pintar el chat) */
		const names = message.images?.length ? (message.attachments ?? []).slice(message.images.length) : message.attachments ?? []

		return (
			<div className="flex flex-col items-end gap-1.5">
				{!!message.images?.length && (
					<div className="flex max-w-[85%] flex-wrap justify-end gap-1.5">
						{message.images.map(url => <img key={url} src={url} alt="Archivo adjunto" className="size-24 rounded-2xl object-cover" />)}
					</div>
				)}
				{names.length > 0 && (
					<div className="flex max-w-[85%] flex-wrap justify-end gap-1.5">
						{names.map(name => (
							<span key={name} className="inline-flex max-w-full items-center gap-1.5 rounded-full border border-primary/25 px-2.5 py-1 text-[11.5px] font-semibold text-primary">
								<PaperclipIcon className="size-3 shrink-0" /><span className="truncate">{name}</span>
							</span>
						))}
					</div>
				)}
				<p className="max-w-[85%] rounded-2xl rounded-br-md bg-primary-gradient px-4 py-2.5 text-sm leading-relaxed whitespace-pre-wrap text-white sm:max-w-[70%]">
					{message.text}
				</p>
			</div>
		)
	}

	return (
		<div className="flex items-start gap-2.5">
			<AssistantAvatar />
			<div className="max-w-[85%] rounded-2xl rounded-tl-md border border-border bg-surface-soft px-4 py-2.5 text-sm leading-relaxed text-foreground sm:max-w-[80%]">
				<ChatRichText text={message.text} />
			</div>
		</div>
	)
}

export default ChatMessageBubble

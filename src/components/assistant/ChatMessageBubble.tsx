import { SparklesIcon } from 'lucide-react'

import { IChatOption, IGuidedMessage } from '@/interfaces/chat'
import { cn } from '@/lib/utils'

/** Avatar del asistente: círculo con el gradiente de marca */
export const AssistantAvatar = ({ className }: { className?: string }) => (
	<span className={cn('grid size-8 shrink-0 place-content-center rounded-full bg-primary-gradient text-white shadow-primary-glow', className)}>
		<SparklesIcon className="size-4" />
	</span>
)

interface Props {
	message: IGuidedMessage
	/** Sólo la última burbuja deja pulsar sus botones: los de arriba ya se contestaron */
	optionsActive?: boolean
	onOption?: (option: IChatOption) => void
}

const ChatMessageBubble = ({ message, optionsActive = false, onOption }: Props) => {
	const isUser = message.role === 'user'

	if (isUser) {
		return (
			<div className="flex flex-col items-end gap-1.5">
				{message.image && <img src={message.image} alt="Referencia adjunta" className="max-h-40 max-w-[70%] rounded-2xl rounded-br-md object-cover" />}
				<p className="max-w-[85%] rounded-2xl rounded-br-md bg-primary-gradient px-4 py-2.5 text-sm leading-relaxed whitespace-pre-wrap text-white sm:max-w-[70%]">
					{message.text}
				</p>
			</div>
		)
	}

	return (
		<div className="flex items-start gap-2.5">
			<AssistantAvatar />
			<div className="flex max-w-[85%] min-w-0 flex-col items-start gap-2 sm:max-w-[80%]">
				<p className="rounded-2xl rounded-tl-md border border-border bg-surface-soft px-4 py-2.5 text-sm leading-relaxed whitespace-pre-wrap text-foreground">
					{message.text}
				</p>

				{/* Resumen en filas: lo que se va a mandar, para revisarlo antes de enviar */}
				{message.card && (
					<dl className="w-full overflow-hidden rounded-2xl border border-border text-[12.5px]">
						{message.card.rows.map(([label, value]) => (
							<div key={label} className="flex gap-3 border-b border-border px-3.5 py-2 last:border-b-0">
								<dt className="w-24 shrink-0 font-bold text-muted-foreground">{label}</dt>
								<dd className="min-w-0 flex-1 whitespace-pre-wrap">{value}</dd>
							</div>
						))}
					</dl>
				)}

				{message.options && message.options.length > 0 && (
					<div className="flex flex-wrap gap-1.5">
						{message.options.map(option => (
							<button
								key={option.value}
								type="button"
								disabled={!optionsActive}
								onClick={() => onOption?.(option)}
								className={cn(
									'cursor-pointer rounded-full px-3.5 py-2 text-[12.5px] font-semibold transition-colors disabled:cursor-default disabled:opacity-45',
									option.primary ? 'bg-primary-gradient text-white shadow-primary-glow' : 'border border-primary/25 text-primary enabled:hover:bg-primary/5',
								)}
							>
								{option.label}
							</button>
						))}
					</div>
				)}
			</div>
		</div>
	)
}

export default ChatMessageBubble

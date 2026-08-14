import { SparklesIcon } from 'lucide-react'

import { IChatMessage } from '@/interfaces/chat'
import { cn } from '@/lib/utils'

/** Avatar del asistente: círculo con el gradiente de marca */
export const AssistantAvatar = ({ className }: { className?: string }) => (
	<span className={cn('grid size-8 shrink-0 place-content-center rounded-full bg-primary-gradient text-white shadow-primary-glow', className)}>
		<SparklesIcon className="size-4" />
	</span>
)

const ChatMessageBubble = ({ message }: { message: IChatMessage }) => {
	const isUser = message.role === 'user'

	if (isUser) {
		return (
			<div className="flex justify-end">
				<p className="max-w-[85%] rounded-2xl rounded-br-md bg-primary-gradient px-4 py-2.5 text-sm leading-relaxed whitespace-pre-wrap text-white sm:max-w-[70%]">
					{message.text}
				</p>
			</div>
		)
	}

	return (
		<div className="flex items-start gap-2.5">
			<AssistantAvatar />
			<p className="max-w-[85%] rounded-2xl rounded-tl-md border border-border bg-surface-soft px-4 py-2.5 text-sm leading-relaxed whitespace-pre-wrap text-foreground sm:max-w-[75%]">
				{message.text}
			</p>
		</div>
	)
}

export default ChatMessageBubble

import { useEffect, useRef } from 'react'

import { Skeleton } from '@/components/ui/skeleton'
import { IChatMessage } from '@/interfaces/chat'
import { CHAT_SUGGESTIONS } from './utils'
import ChatMessageBubble, { AssistantAvatar } from './ChatMessageBubble'

interface Props {
	messages: IChatMessage[]
	sending: boolean
	loadingHistory: boolean
	onSuggestion: (text: string) => void
}

/** Burbuja de "escribiendo…" mientras responde el asistente */
const TypingIndicator = () => (
	<div className="flex items-start gap-2.5">
		<AssistantAvatar />
		<span className="flex items-center gap-1 rounded-2xl rounded-tl-md border border-border bg-surface-soft px-4 py-3.5">
			{[0, 150, 300].map(delay => (
				<span
					key={delay}
					className="size-1.5 animate-bounce rounded-full bg-primary/60"
					style={{ animationDelay: `${delay}ms` }}
				/>
			))}
		</span>
	</div>
)

const EmptyState = ({ onSuggestion }: { onSuggestion: (text: string) => void }) => (
	<div className="m-auto flex max-w-md flex-col items-center gap-3 px-4 text-center">
		<AssistantAvatar className="size-14 rounded-2xl [&_svg]:size-6" />
		<h2 className="text-lg font-bold tracking-tight text-foreground">Tu asistente de servicios</h2>
		<p className="text-sm text-muted-foreground">
			Pregúntale por el estado de tus solicitudes de diseño, correcciones pendientes o próximas entregas.
		</p>
		<div className="mt-2 flex flex-wrap justify-center gap-2">
			{CHAT_SUGGESTIONS.map(suggestion => (
				<button
					key={suggestion}
					className="cursor-pointer rounded-full border border-primary/25 px-3.5 py-2 text-[12.5px] font-semibold text-primary transition-colors hover:bg-primary/5"
					onClick={() => onSuggestion(suggestion)}
				>
					{suggestion}
				</button>
			))}
		</div>
	</div>
)

const HistorySkeleton = () => (
	<div className="flex flex-col gap-4">
		<Skeleton className="h-12 w-3/5 self-end rounded-2xl" />
		<Skeleton className="h-20 w-4/5 rounded-2xl" />
		<Skeleton className="h-12 w-2/5 self-end rounded-2xl" />
		<Skeleton className="h-14 w-3/5 rounded-2xl" />
	</div>
)

const ChatThread = ({ messages, sending, loadingHistory, onSuggestion }: Props) => {
	const bottomRef = useRef<HTMLDivElement>(null)

	useEffect(() => {
		bottomRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' })
	}, [messages, sending])

	const isEmpty = !loadingHistory && messages.length === 0

	return (
		<div className="flex min-h-0 flex-1 flex-col overflow-y-auto px-4 py-5 sm:px-6">
			{loadingHistory && <HistorySkeleton />}
			{isEmpty && <EmptyState onSuggestion={onSuggestion} />}

			{messages.length > 0 && (
				<div className="flex flex-col gap-4">
					{messages.map(message => <ChatMessageBubble key={message.id} message={message} />)}
					{sending && <TypingIndicator />}
				</div>
			)}

			<div ref={bottomRef} />
		</div>
	)
}

export default ChatThread

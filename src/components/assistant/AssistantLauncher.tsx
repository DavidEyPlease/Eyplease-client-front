import { useState } from 'react'
import { ArrowLeftIcon, HistoryIcon, PlusIcon } from 'lucide-react'

import { IconAssistant } from '@/components/Svg/IconAssistant'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { cn } from '@/lib/utils'
import ChatComposer from './ChatComposer'
import ChatThread from './ChatThread'
import ConversationList from './ConversationList'
import useAssistantChat from './useAssistantChat'

type AssistantView = 'chat' | 'history'

const HEADER_ACTION_CLASSES = 'flex cursor-pointer items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-muted-foreground transition-colors hover:bg-surface-soft hover:text-foreground'

/**
 * Punto de entrada del asistente IA de servicios: botón de header que abre un
 * panel lateral con el chat. El hilo vive fuera del Sheet, así cerrar y reabrir
 * el panel no pierde la conversación en curso.
 */
const AssistantLauncher = () => {
	const [open, setOpen] = useState(false)
	const [view, setView] = useState<AssistantView>('chat')
	const {
		conversationId, messages, sending, loadingHistory, deleting,
		send, openConversation, startNewChat, removeConversation,
	} = useAssistantChat()

	const isHistory = view === 'history'

	const onSelectConversation = (id: string) => {
		openConversation(id)
		setView('chat')
	}

	const onNewChat = () => {
		startNewChat()
		setView('chat')
	}

	return (
		<>
			<button
				className="flex cursor-pointer items-center gap-1.5 rounded-full border border-primary/25 px-3 py-1.5 text-[12.5px] font-semibold text-primary transition-colors hover:bg-primary/5 [&_svg]:size-4"
				onClick={() => setOpen(true)}
			>
				<IconAssistant />
				<span className="hidden sm:inline">Asistente</span>
			</button>

			<Sheet open={open} onOpenChange={setOpen}>
				<SheetContent side="right" className="w-full gap-0 p-0 sm:max-w-md">
					<SheetHeader className="flex-row items-center gap-2 border-b border-border py-2.5 pr-12 pl-4">
						<SheetTitle className="flex items-center gap-2 text-sm">
							<IconAssistant />
							Asistente de servicios
						</SheetTitle>

						<div className="ml-auto flex items-center gap-1">
							<button className={HEADER_ACTION_CLASSES} onClick={() => setView(isHistory ? 'chat' : 'history')}>
								{isHistory ? <ArrowLeftIcon className="size-3.5" /> : <HistoryIcon className="size-3.5" />}
								{isHistory ? 'Volver al chat' : 'Historial'}
							</button>
							{!isHistory && (
								<button className={cn(HEADER_ACTION_CLASSES, 'text-primary hover:bg-primary/5 hover:text-primary')} onClick={onNewChat}>
									<PlusIcon className="size-3.5" />
									Nueva
								</button>
							)}
						</div>
					</SheetHeader>

					{isHistory ? (
						<ConversationList
							className="flex-1"
							activeId={conversationId}
							deleting={deleting}
							onSelect={onSelectConversation}
							onNew={onNewChat}
							onDelete={removeConversation}
						/>
					) : (
						<>
							<ChatThread
								messages={messages}
								sending={sending}
								loadingHistory={loadingHistory}
								onSuggestion={send}
							/>
							<ChatComposer sending={sending} onSend={send} />
						</>
					)}
				</SheetContent>
			</Sheet>
		</>
	)
}

export default AssistantLauncher

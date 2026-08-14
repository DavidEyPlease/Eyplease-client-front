import { PlusIcon, Trash2Icon } from 'lucide-react'

import AlertConfirm from '@/components/generics/AlertConfirm'
import InfiniteScrollTrigger from '@/components/generics/InfiniteScrollTrigger'
import Button from '@/components/common/Button'
import { Skeleton } from '@/components/ui/skeleton'
import { API_ROUTES } from '@/constants/api'
import useCursorListQuery from '@/hooks/useCursorListQuery'
import { IChatConversation } from '@/interfaces/chat'
import { cn } from '@/lib/utils'
import { formatDate } from '@/utils/dates'
import { conversationsListKey } from './utils'

interface Props {
	activeId: string | null
	deleting: boolean
	className?: string
	onSelect: (id: string) => void
	onNew: () => void
	onDelete: (id: string) => void
}

const ConversationList = ({ activeId, deleting, className, onSelect, onNew, onDelete }: Props) => {
	const { items, isLoading, hasNextPage, isFetchingNextPage, fetchNextPage } = useCursorListQuery<IChatConversation>(
		API_ROUTES.CHAT.CONVERSATIONS,
		{ customQueryKey: conversationsListKey },
	)

	return (
		<div className={cn('flex min-h-0 flex-col', className)}>
			<div className="border-b border-border p-3">
				<Button
					block
					className="justify-center py-2.5 text-sm"
					text={<><PlusIcon className="size-4" /> Nueva conversación</>}
					onClick={onNew}
				/>
			</div>

			<div className="min-h-0 flex-1 overflow-y-auto p-2">
				{isLoading ? (
					<div className="flex flex-col gap-2 p-1">
						{Array.from({ length: 5 }, (_, index) => <Skeleton key={index} className="h-12 rounded-xl" />)}
					</div>
				) : items.length === 0 ? (
					<p className="px-3 py-8 text-center text-xs font-medium text-muted-foreground">
						Aún no tienes conversaciones. Escribe tu primera pregunta para empezar.
					</p>
				) : (
					<ul className="flex flex-col gap-1">
						{items.map(conversation => {
							const isActive = conversation.id === activeId

							return (
								<li key={conversation.id} className="group relative">
									<button
										className={cn(
											'flex w-full cursor-pointer flex-col gap-0.5 rounded-xl px-3 py-2.5 pr-9 text-left transition-colors',
											isActive ? 'bg-primary/[0.07]' : 'hover:bg-surface-soft',
										)}
										onClick={() => onSelect(conversation.id)}
									>
										<span className={cn('truncate text-[13px] font-semibold', isActive ? 'text-primary' : 'text-foreground')}>
											{conversation.title}
										</span>
										<span className="text-[11px] font-medium text-muted-foreground">
											{formatDate(conversation.last_message_at ?? conversation.created_at)}
										</span>
									</button>

									<AlertConfirm
										title="¿Eliminar esta conversación?"
										description="Se borrará todo el historial de mensajes de esta conversación."
										loading={deleting}
										trigger={
											<button
												className="absolute top-1/2 right-1.5 -translate-y-1/2 cursor-pointer rounded-lg p-1.5 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100 hover:bg-destructive/10 hover:text-destructive focus-visible:opacity-100"
												aria-label={`Eliminar conversación ${conversation.title}`}
											>
												<Trash2Icon className="size-3.5" />
											</button>
										}
										onConfirm={() => onDelete(conversation.id)}
									/>
								</li>
							)
						})}
					</ul>
				)}

				<InfiniteScrollTrigger
					hasNextPage={hasNextPage}
					loading={isFetchingNextPage}
					onLoadMore={fetchNextPage}
				/>
			</div>
		</div>
	)
}

export default ConversationList

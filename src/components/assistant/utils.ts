import { queryKeys } from '@/utils/cache'

export const CONVERSATIONS_ENTITY = 'chat-conversations'
export const MESSAGES_ENTITY = 'chat-messages'

export const conversationsListKey = queryKeys.list(CONVERSATIONS_ENTITY)
export const messagesKey = (conversationId: string) => queryKeys.detail(MESSAGES_ENTITY, conversationId)

/** Arranques sugeridos para el chat vacío; al clickear se envían tal cual */
export const CHAT_SUGGESTIONS = [
	'¿Cómo van mis servicios?',
	'¿Tengo algún servicio en corrección?',
	'¿Cuál fue mi última entrega?',
]

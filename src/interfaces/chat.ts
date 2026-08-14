export type ChatRole = 'user' | 'assistant'

export interface IChatConversation {
	id: string
	title: string
	last_message_at: string | null
	created_at: string
}

export interface IChatMessage {
	id: string
	role: ChatRole
	text: string
	created_at: string
}

export interface IChatSendPayload {
	message: string
	conversation_id: string | null
}

export interface IChatSendResponse {
	conversation_id: string
	message: string
}

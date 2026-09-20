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
	/** Nombres de los archivos que compartió en este mensaje (así llega del historial) */
	attachments?: string[]
	/** Sólo en esta sesión: miniaturas de lo que acaba de mandar, para no esperar al historial */
	images?: string[]
}

/** Un archivo ya subido a su carpeta del chat: al servidor sólo viajan estas referencias */
export interface IChatAttachmentRef {
	fileUri: string
	name: string
	extension: string
	/** Copia ligera en JPEG para que la IA la vea; la original es la que recibe el diseñador */
	previewUri?: string | null
}

export interface IChatSendPayload {
	message: string
	conversation_id: string | null
	attachments?: IChatAttachmentRef[]
}

export interface IChatSendResponse {
	conversation_id: string
	message: string
}

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

/** Botón bajo una burbuja del Asistente, en los flujos guiados. */
export interface IChatOption {
	label: string
	value: string
	primary?: boolean
}

/**
 * Mensaje de un flujo guiado («Pídeme un diseño»): vive sólo en pantalla, no viaja al chat del
 * servidor. Además del texto puede llevar botones, un resumen en filas o una imagen.
 */
export interface IGuidedMessage extends IChatMessage {
	/** Sólo responden los de la última burbuja */
	options?: IChatOption[]
	card?: { rows: Array<[string, string]> }
	image?: string
}

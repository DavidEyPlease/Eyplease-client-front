export type ChatRole = 'user' | 'assistant'

export interface IChatConversation {
	id: string
	title: string
	last_message_at: string | null
	created_at: string
}

/** Un formato de una pieza que el Asistente enseñó en el chat */
export interface IChatPieceFile {
	artifact: 'image' | 'image_square' | 'video'
	/** «Vertical», «Cuadrada», «Video» */
	label: string
	url: string
	uri: string
	ext: string
}

/**
 * Una pieza que el Asistente le ENSEÑÓ (herramienta show-pieces): la API la manda con la respuesta y
 * con el historial, con sus archivos vigentes, y el chat la pinta como tarjeta con su botón de descargar.
 */
export interface IChatPiece {
	id: string
	title: string
	section: string
	person: string | null
	shared_at: string | null
	is_regenerating: boolean
	live: boolean
	/** Las de clientes de Eyplease no las manda ella: no se marcan como enviadas */
	can_mark_sent: boolean
	files: IChatPieceFile[]
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
	/** Las piezas que el Asistente le enseñó en esta respuesta */
	pieces?: IChatPiece[]
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
	pieces?: IChatPiece[]
}

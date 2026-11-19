import { useEffect, useRef, useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

import { API_ROUTES } from '@/constants/api'
import useCursorListQuery from '@/hooks/useCursorListQuery'
import useFetchQuery from '@/hooks/useFetchQuery'
import useRequestQuery from '@/hooks/useRequestQuery'
import { ApiResponse } from '@/interfaces/common'
import { ChatRole, IChatAttachmentRef, IChatConversation, IChatMessage, IChatSendPayload, IChatSendResponse } from '@/interfaces/chat'
import { queryKeys } from '@/utils/cache'
import { lastActivity, sameDay, whenLabel } from './resume'
import { CONVERSATIONS_ENTITY, conversationsListKey, messagesKey } from './utils'

const HISTORY_STALE_TIME_MS = 60_000

const buildMessage = (role: ChatRole, text: string, extra: Partial<IChatMessage> = {}): IChatMessage => ({
	id: crypto.randomUUID(),
	role,
	text,
	created_at: new Date().toISOString(),
	...extra,
})

/** «Seguir lo de ayer»: su última conversación es de otro día y se le ofrece volver a ella (ver resume.ts) */
export interface ChatResumeOffer {
	title: string
	/** «ayer», «el martes», «el 12 de octubre» */
	when: string
	open: () => void
}

/** Lo que acompaña a un mensaje: las referencias para el servidor y las miniaturas para pintarlo ya */
export interface ChatSendExtras {
	attachments?: IChatAttachmentRef[]
	images?: string[]
}

/**
 * Estado del hilo activo. El front solo persiste el conversation_id: los mensajes
 * del hilo viven en estado local (optimistas incluidos) y el historial se hidrata
 * desde la API al reabrir una conversación.
 */
/** El texto para ella si la API dijo que ya usó los mensajes de su plan este mes (código ASSISTANT_LIMIT). */
const limitMessage = (error: unknown): string | null => {
	const body = error as { message?: string, errors?: { code?: string } } | null
	return body?.errors?.code === 'ASSISTANT_LIMIT' && body.message ? body.message : null
}

const useAssistantChat = () => {
	const queryClient = useQueryClient()

	const [conversationId, setConversationId] = useState<string | null>(null)
	const [messages, setMessages] = useState<IChatMessage[]>([])

	/* Refs para no pisar el hilo optimista cuando el historial resuelve a mitad de un envío */
	const sendingRef = useRef(false)
	const messagesRef = useRef(messages)
	messagesRef.current = messages

	const { request, requestState } = useRequestQuery({
		onError: (error) => {
			/* El tope del mes no es un fallo: lo dice el propio Asistente en el hilo (ver `send`) */
			if (limitMessage(error)) return
			toast.error('No se pudo enviar el mensaje. Inténtalo de nuevo.')
		},
	})

	const { request: deleteRequest, requestState: deleteState } = useRequestQuery({
		invalidateQueries: [queryKeys.entity(CONVERSATIONS_ENTITY)],
	})

	const { response: historyResponse, loading: loadingHistory } = useFetchQuery<IChatMessage[]>(
		API_ROUTES.CHAT.CONVERSATION_MESSAGES.replace('{id}', conversationId ?? ''),
		{
			enabled: !!conversationId,
			customQueryKey: messagesKey(conversationId ?? 'new'),
			staleTime: HISTORY_STALE_TIME_MS,
			/* Una entrega de diseño llega sola al hilo (la deja la API cuando el pedido queda listo): al volver a la
			   ventana se relee, así aparece sin recargar */
			refetchOnWindowFocus: true,
		},
	)

	/* El historial manda al abrir una conversación */
	useEffect(() => {
		if (!conversationId || sendingRef.current) return
		if (historyResponse?.data) setMessages(historyResponse.data)
	}, [conversationId, historyResponse])

	const openConversation = (id: string) => {
		if (id === conversationId) return
		setConversationId(id)
		setMessages([])
	}

	const startNewChat = () => {
		setConversationId(null)
		setMessages([])
	}

	/*
	 * Seguir donde se quedó (opción A, ver resume.ts). La más reciente es la primera del listado (la misma caché que el
	 * Historial). Si es de hoy, se abre sola UNA vez al cargar; si es de otro día, se ofrece «Seguir lo de…».
	 */
	const recent = useCursorListQuery<IChatConversation>(API_ROUTES.CHAT.CONVERSATIONS, { customQueryKey: conversationsListKey })
	const latest = recent.items[0] ?? null
	const resumed = useRef(false)
	useEffect(() => {
		if (resumed.current || !recent.isSuccess) return
		resumed.current = true
		// Si ya empezó algo (un encargo de una página, un mensaje), no se le cambia la conversación
		if (!latest || conversationId || messagesRef.current.length) return
		if (sameDay(lastActivity(latest))) {
			setConversationId(latest.id)
			setMessages([])
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps -- sólo la primera vez que llega el listado
	}, [recent.isSuccess, latest])

	/* La pestaña puede quedarse abierta días: al volver a ella, si lo abierto es de otro día, empieza en blanco con «Seguir» */
	useEffect(() => {
		const onVisible = () => {
			if (document.visibilityState !== 'visible' || sendingRef.current) return
			const last = messagesRef.current[messagesRef.current.length - 1]
			if (last && !sameDay(last.created_at)) startNewChat()
		}
		document.addEventListener('visibilitychange', onVisible)
		return () => document.removeEventListener('visibilitychange', onVisible)
	}, [])

	/** @returns false si falló, para que el composer restaure el texto */
	const send = async (text: string, extras: ChatSendExtras = {}) => {
		const attachments = extras.attachments ?? []
		/* El servidor pide texto: si sólo manda archivos, el mensaje lo dice por ella */
		const message = text.trim() || (attachments.length ? (attachments.length === 1 ? 'Te comparto este archivo.' : 'Te comparto estos archivos.') : '')
		if (!message || requestState.loading) return false

		sendingRef.current = true
		setMessages(prev => [...prev, buildMessage('user', message, {
			attachments: attachments.map(item => item.name),
			images: extras.images,
		})])

		try {
			const response = await request<IChatSendPayload, IChatSendResponse>(
				'POST',
				API_ROUTES.CHAT.SEND_SERVICES_MESSAGE,
				{ message, conversation_id: conversationId, ...(attachments.length ? { attachments } : {}) },
			)

			const thread = [...messagesRef.current, buildMessage('assistant', response.data.message, { pieces: response.data.pieces ?? [] })]
			setMessages(thread)

			/* Se siembra la caché del historial para que fijar el id no dispare un refetch */
			const cached: ApiResponse<IChatMessage[]> = { data: thread, success: true }
			queryClient.setQueryData(messagesKey(response.data.conversation_id), cached)

			if (!conversationId) setConversationId(response.data.conversation_id)

			/* La conversación aparece (nueva) o sube al tope del listado */
			queryClient.invalidateQueries({ queryKey: queryKeys.entity(CONVERSATIONS_ENTITY) })

			return true
		} catch (error) {
			/* Ya usó sus mensajes del mes: su mensaje se queda y el Asistente le contesta cuándo se
			   renuevan (el texto viene de la API, con el plan que le daría más) */
			const limit = limitMessage(error)
			if (limit) {
				setMessages(prev => [...prev, buildMessage('assistant', limit)])
				return true
			}

			/* El mensaje no llegó: se saca del hilo y el composer lo devuelve al input */
			setMessages(prev => prev.slice(0, -1))
			return false
		} finally {
			sendingRef.current = false
		}
	}

	const removeConversation = async (id: string) => {
		await deleteRequest('DELETE', API_ROUTES.CHAT.DELETE_CONVERSATION.replace('{id}', id))
		queryClient.removeQueries({ queryKey: messagesKey(id) })

		if (id === conversationId) startNewChat()
		toast.success('Conversación eliminada')
	}

	return {
		conversationId,
		messages,
		sending: requestState.loading,
		loadingHistory: loadingHistory && !!conversationId && messages.length === 0,
		deleting: deleteState.loading,
		send,
		openConversation,
		startNewChat,
		removeConversation,
		resumeOffer: (latest && !conversationId && messages.length === 0 && !requestState.loading && !sameDay(lastActivity(latest))
			? { title: latest.title, when: whenLabel(lastActivity(latest)), open: () => openConversation(latest.id) }
			: null) as ChatResumeOffer | null,
	}
}

export default useAssistantChat

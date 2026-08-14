import { useState } from 'react'

import IconSend from '@/components/Svg/IconSend'
import { Textarea } from '@/components/ui/textarea'

interface Props {
	sending: boolean
	onSend: (text: string) => Promise<boolean>
}

const ChatComposer = ({ sending, onSend }: Props) => {
	const [text, setText] = useState('')

	const submit = async () => {
		const value = text.trim()
		if (!value || sending) return

		setText('')
		const sent = await onSend(value)

		/* Si el envío falla, el texto vuelve al input para reintentar */
		if (!sent) setText(value)
	}

	const onKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
		if (event.key !== 'Enter' || event.shiftKey) return
		event.preventDefault()
		submit()
	}

	return (
		<div className="border-t border-border p-3">
			<div className="flex items-end gap-2">
				<Textarea
					rows={1}
					value={text}
					placeholder="Pregunta por tus servicios…"
					className="max-h-36 min-h-11 flex-1 resize-none"
					disabled={sending}
					onChange={event => setText(event.target.value)}
					onKeyDown={onKeyDown}
				/>
				<button
					className="grid size-11 shrink-0 cursor-pointer place-content-center rounded-full bg-primary-gradient text-white shadow-primary-glow transition hover:brightness-[1.03] active:scale-95 disabled:pointer-events-none disabled:opacity-50 disabled:shadow-none"
					disabled={!text.trim() || sending}
					aria-label="Enviar mensaje"
					onClick={submit}
				>
					<IconSend />
				</button>
			</div>
			<p className="mt-1.5 hidden px-1 text-[10.5px] font-medium text-muted-foreground sm:block">
				Enter envía · Shift + Enter salto de línea
			</p>
		</div>
	)
}

export default ChatComposer

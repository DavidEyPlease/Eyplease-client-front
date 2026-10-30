import { useEffect, useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { CheckIcon, CopyIcon, GiftIcon, Loader2Icon, MessageCircleIcon, SendIcon } from 'lucide-react'
import { toast } from 'sonner'

import { API_ROUTES } from '@/constants/api'
import { UNIT_INVITATIONS_KEY } from '@/hooks/useUnitInvitations'
import { ApiResponse } from '@/interfaces/common'
import { GiftInfo, InvitationShare } from '@/interfaces/invitations'
import Panel from '@/pages/Estrategia/components/Panel'
import { titleCaseName } from '@/pages/Hoy/lib'
import HttpService from '@/services/http'
import shareInvitation from './shareInvitation'

interface Props {
    personId: string | null
    gift: GiftInfo | null
    /** Cuántas faltan por invitar después de ésta: «Invitar a la siguiente» */
    remaining: number
    onClose: () => void
    onNext: () => void
    /** «Ahora no»: pasa a la siguiente sin mandarla */
    onSkip: () => void
}

type Channel = 'share' | 'whatsapp' | 'copy' | 'image'

/**
 * Invitar (o recordarle) a UNA consultora, como «Tu lista de hoy»: su imagen con su nombre y el de su Directora, el
 * mensaje con su liga personal (se puede cambiar) y mandarlo desde su teléfono. Al mandarlo, la siguiente.
 */
const InviteDialog = ({ personId, gift, remaining, onClose, onNext, onSkip }: Props) => {
    const queryClient = useQueryClient()
    const [message, setMessage] = useState('')
    const [sending, setSending] = useState(false)
    const [sent, setSent] = useState(false)

    // Crea (o trae) su invitación: la liga, los mensajes y la imagen
    const invitation = useQuery({
        queryKey: ['unit', 'invitation', personId],
        queryFn: async () => (await HttpService.post<ApiResponse<InvitationShare>>(API_ROUTES.UNIT.INVITATIONS, { person_id: personId })).data,
        enabled: !!personId,
        staleTime: 10 * 60 * 1000,
        retry: false,
    })
    const data = invitation.data
    const image = useQuery({
        queryKey: ['unit', 'invitation-image', data?.id],
        queryFn: () => HttpService.get<Blob>(API_ROUTES.UNIT.INVITATION_IMAGE.replace('{id}', data!.id), { responseType: 'blob' }),
        enabled: !!data?.id,
        staleTime: 10 * 60 * 1000,
        retry: 1,
    })
    const [src, setSrc] = useState<string | null>(null)
    useEffect(() => {
        if (!image.data) { setSrc(null); return }
        const url = URL.createObjectURL(image.data)
        setSrc(url)
        return () => { setTimeout(() => URL.revokeObjectURL(url), 1500) }
    }, [image.data])

    useEffect(() => { setSent(false) }, [personId])
    useEffect(() => { if (data) setMessage(data.message) }, [data])

    const reminder = data ? ['invitada', 'abrio'].includes(data.list_status) : false
    const name = data ? titleCaseName(data.person.name) : ''
    const first = data?.person.first_name ?? ''

    const markSent = async (channel: Channel) => {
        if (!data) return
        try {
            await HttpService.post(API_ROUTES.UNIT.INVITATION_SENT.replace('{id}', data.id), { channel, reminder })
        } catch { /* se manda igual; sólo no queda marcada */ }
        queryClient.invalidateQueries({ queryKey: UNIT_INVITATIONS_KEY })
        setSent(true)
    }

    // Al salir, su invitación queda vieja (ya va de recordatorio): se vuelve a pedir la próxima vez que se abra
    const leave = (then: () => void) => () => {
        queryClient.invalidateQueries({ queryKey: ['unit', 'invitation'], refetchType: 'none' })
        then()
    }

    const send = async () => {
        if (!data) return
        setSending(true)
        try {
            const outcome = await shareInvitation(image.data ?? null, message, data.image_name)
            if (outcome === 'canceled') return
            if (outcome === 'downloaded') toast.success(`Bajé la imagen y copié el mensaje: mándaselos a ${first} por WhatsApp.`)
            await markSent(outcome === 'shared' ? 'share' : 'image')
        } finally {
            setSending(false)
        }
    }

    const openWhatsApp = async () => {
        if (!data?.person.whatsapp) return
        window.open(`https://wa.me/${data.person.whatsapp}?text=${encodeURIComponent(message)}`, '_blank', 'noopener')
        await markSent('whatsapp')
    }

    const copy = async () => {
        try {
            await navigator.clipboard.writeText(message)
            toast.success('Mensaje copiado. Pégalo en su chat junto con la imagen.')
            await markSent('copy')
        } catch {
            toast.error('No se pudo copiar. Selecciona el texto y cópialo a mano.')
        }
    }

    const footer = !data ? undefined : sent ? (
        <div className="grid gap-2 sm:grid-cols-2">
            {remaining > 0 && !reminder
                ? <button type="button" onClick={leave(onNext)} className="hoy-cta flex h-12 cursor-pointer items-center justify-center gap-2 rounded-full px-5 text-[14.5px] font-bold text-white">Invitar a la siguiente <span className="opacity-80">({remaining})</span></button>
                : null}
            <button type="button" onClick={leave(onClose)} className="flex h-12 cursor-pointer items-center justify-center rounded-full border border-border px-5 text-[14px] font-bold">Cerrar</button>
        </div>
    ) : (
        <div className="grid gap-2">
            <button type="button" onClick={send} disabled={sending || image.isLoading} className="hoy-cta flex h-12 cursor-pointer items-center justify-center gap-2 rounded-full px-5 text-[14.5px] font-bold text-white disabled:cursor-default disabled:opacity-60">
                {sending || image.isLoading ? <Loader2Icon className="size-4 animate-spin" /> : <SendIcon className="size-4" />}
                {image.isLoading ? 'Preparando su imagen…' : reminder ? 'Mandar el recordatorio' : 'Mandar imagen y mensaje'}
            </button>
            <div className="grid grid-cols-2 gap-2">
                {data.person.whatsapp
                    ? <button type="button" onClick={openWhatsApp} className="flex h-11 cursor-pointer items-center justify-center gap-1.5 rounded-full bg-[#25D366]/12 px-3 text-[13px] font-bold text-[#0b7a5c] hover:bg-[#25D366]/20 dark:text-[#5BE39A]"><MessageCircleIcon className="size-4" /> Su WhatsApp</button>
                    : !reminder ? <button type="button" onClick={onSkip} className="flex h-11 cursor-pointer items-center justify-center rounded-full border border-border px-3 text-[13px] font-bold text-muted-foreground hover:text-foreground">Ahora no</button> : <span />}
                <button type="button" onClick={copy} className="flex h-11 cursor-pointer items-center justify-center gap-1.5 rounded-full border border-border px-3 text-[13px] font-bold hover:border-[#6C47FF]/40"><CopyIcon className="size-4" /> Copiar mensaje</button>
            </div>
        </div>
    )

    return (
        <Panel
            open={!!personId}
            onClose={leave(onClose)}
            title={!data ? 'Invitar con regalo' : sent ? `Listo, ${first}` : reminder ? `Recordarle a ${name}` : `Invitar a ${name}`}
            description={data && !sent ? (data.person.has_orders ? 'Ya tiene pedidos: su estrategia del mes ya está armada.' : 'Su estrategia se arma en cuanto llegue su próximo pedido.') : undefined}
            footer={footer}
        >
            {invitation.isLoading && <div className="grid place-items-center py-16"><Loader2Icon className="size-7 animate-spin text-primary" /></div>}
            {invitation.error && (
                <p className="rounded-xl bg-destructive/10 px-4 py-3 text-center text-sm font-semibold text-destructive">
                    {(invitation.error as { message?: string })?.message || 'No pudimos preparar su invitación. Inténtalo otra vez.'}
                </p>
            )}

            {data && sent && (
                <div className="grid justify-items-center gap-3 py-6 text-center">
                    <span className="grid size-14 place-items-center rounded-full bg-[linear-gradient(135deg,#E5077D,#6C47FF)] text-white"><CheckIcon className="size-7" strokeWidth={3} /></span>
                    <p className="text-[17px] font-extrabold">{reminder ? `Le recordaste su regalo a ${first}` : `${first} ya tiene su regalo en camino`}</p>
                    <p className="max-w-[40ch] text-[13.5px] text-muted-foreground">Cuando abra su liga o active su regalo, aquí lo ves. Si lo activa, te avisamos.</p>
                </div>
            )}

            {data && !sent && (
                <div className="grid gap-4 sm:grid-cols-[220px_minmax(0,1fr)]">
                    <div className="mx-auto w-full max-w-[220px]">
                        <div className="aspect-[4/5] overflow-hidden rounded-2xl bg-muted shadow-card">
                            {src ? <img src={src} alt={`Invitación para ${name}`} className="size-full object-cover" /> : <div className="hoy-skel size-full" />}
                        </div>
                    </div>
                    <div className="grid content-start gap-3">
                        {gift && !reminder && (
                            <p className="flex items-start gap-2.5 rounded-2xl bg-[#6C47FF]/8 px-3.5 py-3 text-[13px] leading-snug">
                                <GiftIcon className="mt-0.5 size-4 shrink-0 text-[#E5077D]" />
                                <span>Le regalas {gift.months === 1 ? 'un mes' : `${gift.months} meses`} de «{gift.name}» (valor ${gift.value.toLocaleString('es-MX')}). Va a tu nombre y a ti no te cuesta.</span>
                            </p>
                        )}
                        <label className="grid gap-1.5">
                            <span className="text-[12px] font-bold text-muted-foreground uppercase">Tu mensaje</span>
                            <textarea value={message} onChange={event => setMessage(event.target.value)} rows={9} className="w-full resize-y rounded-2xl border border-input bg-surface-soft px-3.5 py-3 text-[14px] leading-relaxed outline-none focus:border-primary-light focus:bg-card focus:ring-4 focus:ring-primary/15 dark:bg-input/30" />
                        </label>
                        <p className="text-[12px] text-muted-foreground">La liga es sólo de {first}: con ella abre su regalo y su estrategia.</p>
                    </div>
                </div>
            )}
        </Panel>
    )
}

export default InviteDialog

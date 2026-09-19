import { useEffect, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { SparklesIcon } from 'lucide-react'
import { toast } from 'sonner'

import Modal from '@/components/common/Modal'
import useChallenges, { fetchChallengeSuggestions } from '@/hooks/useChallenges'
import { titleCaseName } from '@/pages/Hoy/lib'

interface Props {
    open: boolean
    onOpenChange: (open: boolean) => void
}

/**
 * «Proponme un reto»: la API revisa sus números y le propone un reto con su porqué; si lo
 * acepta queda en Mis retos y el avance se llena solo. Es el mismo flujo que el Asistente de la
 * app (allá va dentro del chat), con el mismo copy.
 */
const ProposalDialog = ({ open, onOpenChange }: Props) => {
    const { create, creating } = useChallenges()
    const [index, setIndex] = useState(0)

    const { data: suggestions = [], isLoading, isError } = useQuery({
        queryKey: ['challenges', 'suggestions'],
        queryFn: fetchChallengeSuggestions,
        enabled: open,
        staleTime: 0,
        gcTime: 0,
        retry: false,
    })

    useEffect(() => { if (open) setIndex(0) }, [open])

    const suggestion = suggestions[index % Math.max(suggestions.length, 1)]

    const accept = async () => {
        if (!suggestion) return
        try {
            await create({ type: suggestion.type, target: suggestion.target, params: suggestion.params })
            toast.success('Reto registrado. El avance se llena solo con tus reportes y con lo que compartas.')
            onOpenChange(false)
        } catch (error) {
            toast.error((error as { message?: string })?.message || 'No se pudo registrar el reto. Inténtalo de nuevo.')
        }
    }

    return (
        <Modal open={open} size="md" title="Proponme un reto" onOpenChange={onOpenChange}>
            {isLoading ? (
                <div className="grid gap-2.5">
                    <p className="flex items-center gap-2 text-[13px] text-muted-foreground"><SparklesIcon className="size-4 animate-pulse text-primary" /> Revisando tus números…</p>
                    <span className="hoy-skel h-24 rounded-2xl" />
                </div>
            ) : isError ? (
                <p className="text-[13px] text-muted-foreground">No pude revisar tus números en este momento. Inténtalo de nuevo en un rato.</p>
            ) : !suggestion ? (
                <p className="text-[13px] text-muted-foreground">
                    Por ahora no tengo un reto nuevo que proponerte: ya aceptaste los de este mes, o todavía no hay reportes ni piezas con qué medirlos.
                </p>
            ) : (
                <div className="grid gap-3.5">
                    <div className="rounded-2xl border border-[#6C47FF]/25 bg-[#6C47FF]/5 p-4">
                        <p className="text-[15px] leading-snug font-extrabold">{suggestion.title}</p>
                        <p className="mt-1 text-[12.5px] whitespace-pre-line text-muted-foreground">{suggestion.description}</p>
                    </div>

                    {suggestion.people.length > 0 && (
                        <ul className="divide-y rounded-2xl border text-[12.5px]">
                            {suggestion.people.slice(0, 8).map((person, position) => (
                                <li key={person.id} className="flex items-center justify-between gap-3 px-3.5 py-2">
                                    <span className="truncate font-semibold">{titleCaseName(person.name)}</span>
                                    <span className="shrink-0 text-muted-foreground">{position + 1} · {person.actives} activas</span>
                                </li>
                            ))}
                        </ul>
                    )}

                    <div className="flex flex-wrap justify-end gap-2">
                        <button type="button" onClick={() => onOpenChange(false)} className="h-10 cursor-pointer rounded-xl px-4 text-[13px] font-bold text-muted-foreground hover:bg-foreground/5">Ahora no</button>
                        {suggestions.length > 1 && (
                            <button type="button" onClick={() => setIndex(value => value + 1)} className="h-10 cursor-pointer rounded-xl bg-foreground/5 px-4 text-[13px] font-bold hover:bg-foreground/10">Otro</button>
                        )}
                        <button type="button" disabled={creating} onClick={accept} className="hoy-cta h-10 cursor-pointer rounded-xl px-5 text-[13px] font-bold text-white disabled:opacity-60">
                            {creating ? 'Registrando…' : 'Aceptar el reto'}
                        </button>
                    </div>
                </div>
            )}
        </Modal>
    )
}

export default ProposalDialog

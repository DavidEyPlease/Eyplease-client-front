import { useState } from 'react'
import { CopyIcon, PackagePlusIcon } from 'lucide-react'
import { toast } from 'sonner'

import { NextOrder, NextOrderLine } from '@/interfaces/inventory'
import { money, pieces } from '../format'
import { Card, Chip } from './Chips'
import ProductShape from './ProductShape'

/** Las que se ven sin abrir: el resto con «Ver las N» (en el teléfono no empuja «Lo que tienes» hasta abajo) */
const SHOWN = 3

const shadeOf = (line: NextOrderLine) => line.shade ? ` · ${line.shade.replace(/^tono\s+/i, 'Tono ')}` : ''

/** «sale ~2 al mes»: nunca «0 al mes» (si salió algo, al menos 1) */
const pace = (monthly: number) => `sale${monthly > 1.5 ? 'n' : ''} ~${Math.max(1, Math.round(monthly))} al mes`

/** «te alcanza ~2 semanas» / «menos de una semana» */
const lasts = (weeks: number | null) => {
    if (weeks === null) return null
    if (weeks < 1) return 'te alcanza menos de una semana'
    const rounded = Math.round(weeks)
    return `te alcanza ~${rounded} ${rounded === 1 ? 'semana' : 'semanas'}`
}

/** Lo que le queda y para cuánto le alcanza (lo agotado lleva su etiqueta y cuántas salen) */
const lowDetail = (line: NextOrderLine) => [`te ${line.on_hand === 1 ? 'queda 1' : `quedan ${pieces(line.on_hand)}`}`, lasts(line.weeks_left)].filter(Boolean).join(' · ')

/** El texto que se copia: para pegarlo en su pedido o mandárselo a su Directora */
const listText = (lines: NextOrderLine[], units: number, value: number) => [
    'Para mi próximo pedido:',
    ...lines.map(line => `• ${pieces(line.suggested)} × ${line.name}${shadeOf(line)}${line.manual_name ? '' : ` (${line.sku})`}`),
    `Total: ${pieces(units)} ${units === 1 ? 'pieza' : 'piezas'}${value > 0 ? `, ${money(value)} a precio de clienta` : ''}.`,
].join('\n')

/**
 * «Para tu próximo pedido» (noviembre 2026; lo pidió una Directora: «qué necesito pedir en el siguiente pedido»).
 * Sale de lo que se mueve en su inventario: lo que vende («Ya me compró») y lo que baja con −. Lo agotado primero y
 * luego lo que no le alcanza para las próximas semanas, cada uno con cuántas pedir. Se copia como lista.
 */
const NextOrderCard = ({ nextOrder }: { nextOrder: NextOrder }) => {
    const [all, setAll] = useState(false)
    const { lines, has_signal: hasSignal, cover_weeks: coverWeeks } = nextOrder
    const units = lines.reduce((sum, line) => sum + line.suggested, 0)
    const value = lines.reduce((sum, line) => sum + line.price * line.suggested, 0)
    const costed = lines.filter(line => line.unit_cost !== null)
    const cost = costed.reduce((sum, line) => sum + (line.unit_cost ?? 0) * line.suggested, 0)
    const shown = all ? lines : lines.slice(0, SHOWN)

    const copy = async () => {
        try {
            await navigator.clipboard.writeText(listText(lines, units, value))
            toast.success('Lista copiada. Pégala en tu pedido o mándasela a tu Directora.')
        } catch {
            toast.error('No se pudo copiar. Intenta de nuevo.')
        }
    }

    return (
        <Card title="Para tu próximo pedido" aside={lines.length ? <small className="text-[11.5px] font-bold text-muted-foreground">{lines.length === 1 ? '1 producto' : `${lines.length} productos`}</small> : undefined}>
            {!hasSignal ? (
                <p className="mt-2 flex items-start gap-2.5 text-[13px] leading-snug text-muted-foreground">
                    <PackagePlusIcon className="mt-0.5 size-4 shrink-0 text-[#6C47FF] dark:text-[#A894FF]" />
                    <span>Aquí te digo qué volver a pedir y cuántas. Sale de lo que vendes: anótalo en «Ya me compró» o bájalo con − cuando se te acabe algo.</span>
                </p>
            ) : !lines.length ? (
                <p className="mt-2 text-[13px] leading-snug text-muted-foreground">
                    <b className="text-foreground">Tienes suficiente de lo que vendes</b> para las próximas {coverWeeks} semanas. Si algo se te acaba, aquí te aviso.
                </p>
            ) : (
                <>
                    <p className="mt-1.5 text-[12.5px] leading-snug text-muted-foreground">Se te acabó o no te alcanza para las próximas {coverWeeks} semanas, según lo que vendes.</p>
                    <div className="mt-1">
                        {shown.map(line => (
                            <div key={line.sku} className="flex items-center gap-3 border-b border-border py-2.5 last:border-b-0">
                                <ProductShape name={line.name} className="size-9" />
                                <span className="min-w-0 flex-1">
                                    <b className="block text-[13.5px] leading-snug font-bold">{line.name}</b>
                                    {line.shade && <span className="block truncate text-[11.5px] font-semibold text-muted-foreground">{line.shade}</span>}
                                    <span className="mt-0.5 flex flex-wrap items-center gap-x-1.5 gap-y-1 text-[11.5px] leading-snug text-muted-foreground">
                                        {line.reason === 'out' ? <><Chip tone="magenta">Se te acabó</Chip>{pace(line.monthly)}</> : lowDetail(line)}
                                    </span>
                                </span>
                                <span className="shrink-0 text-right">
                                    <small className="block text-[10.5px] font-bold tracking-wide text-muted-foreground uppercase">Pide</small>
                                    <b className="block text-[19px] leading-none font-extrabold tabular-nums text-[#4E31C0] dark:text-[#BBAAFF]">{pieces(line.suggested)}</b>
                                </span>
                            </div>
                        ))}
                    </div>
                    {lines.length > SHOWN && (
                        <button type="button" onClick={() => setAll(value => !value)} className="mt-1 w-full cursor-pointer py-1.5 text-[12.5px] font-bold text-[#6C47FF] dark:text-[#A894FF]">
                            {all ? 'Ver menos' : `Ver los ${lines.length}`}
                        </button>
                    )}
                    <div className="mt-2 flex flex-wrap items-center justify-between gap-x-3 gap-y-2 rounded-2xl bg-foreground/[0.04] px-3.5 py-2.5">
                        <span className="text-[12.5px] leading-snug">
                            <b className="block text-[14px] font-extrabold">{pieces(units)} {units === 1 ? 'pieza' : 'piezas'}{value > 0 && <> · {money(value)}</>}</b>
                            <span className="text-muted-foreground">
                                {value > 0 ? 'a precio de clienta' : ''}
                                {costed.length > 0 && <>{value > 0 ? ' · ' : ''}a ti te cuesta{costed.length < lines.length ? ' más de' : ''} ~{money(cost)}</>}
                            </span>
                        </span>
                        <button type="button" onClick={copy} className="flex h-10 cursor-pointer items-center gap-2 rounded-full bg-[#4E31C0] px-4 text-[13px] font-bold text-white">
                            <CopyIcon className="size-4" /> Copiar la lista
                        </button>
                    </div>
                </>
            )}
        </Card>
    )
}

export default NextOrderCard

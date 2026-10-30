import { useMemo, useState } from 'react'
import { GiftIcon, SearchIcon, UsersIcon } from 'lucide-react'

import useUnitInvitations from '@/hooks/useUnitInvitations'
import { InvitationStatus, UnitInvitationRow } from '@/interfaces/invitations'
import { cn } from '@/lib/utils'
import Panel from '@/pages/Estrategia/components/Panel'
import { titleCaseName } from '@/pages/Hoy/lib'
import InviteDialog from './InviteDialog'

const TAG = 'inline-flex h-[22px] items-center rounded-full px-2.5 text-[10.5px] font-bold tracking-wide whitespace-nowrap'

const TABS: Array<{ key: InvitationStatus, label: string }> = [
    { key: 'sin_invitar', label: 'Por invitar' },
    { key: 'invitada', label: 'Invitadas' },
    { key: 'abrio', label: 'Abrieron' },
    { key: 'activo', label: 'Activaron' },
    { key: 'ya_usa', label: 'Ya la usan' },
]

/** «hoy», «ayer», «hace 5 días», «hace 3 semanas» */
const hace = (iso: string | null | undefined) => {
    if (!iso) return null
    const days = Math.max(0, Math.floor((Date.now() - new Date(iso).getTime()) / 86400000))
    if (days === 0) return 'hoy'
    if (days === 1) return 'ayer'
    if (days < 14) return `hace ${days} días`
    return `hace ${Math.round(days / 7)} semanas`
}
const dia = (iso: string | null | undefined) => (iso ? new Date(iso).toLocaleDateString('es-MX', { day: 'numeric', month: 'short' }) : null)
const initials = (name: string) => name.trim().split(/\s+/).slice(0, 2).map(word => word[0]?.toUpperCase() ?? '').join('')

const detalle = (row: UnitInvitationRow): string => {
    const inv = row.invitation
    switch (row.status) {
        case 'sin_invitar': return row.has_orders ? 'Su estrategia ya está lista' : 'Sin pedidos recientes'
        case 'invitada': return `La invitaste ${hace(inv?.last_sent_at ?? inv?.sent_at) ?? ''}${inv?.times_reminded ? ` · ${inv.times_reminded} ${inv.times_reminded === 1 ? 'recordatorio' : 'recordatorios'}` : ''}`
        case 'abrio': return `Abrió su regalo ${hace(inv?.opened_at) ?? ''} y no lo ha activado`
        case 'activo': return inv?.gift_applied ? `Activó su regalo · hasta el ${dia(inv.gift_ends_at)}` : 'Creó su cuenta'
        case 'ya_usa': return row.plan ? `Ya usa Eyplease+ · ${row.plan}` : 'Ya usa Eyplease+'
    }
}

/**
 * «Invitar con regalo» en Mi unidad (David, 29-oct-2026): cuántas invitó, cuántas abrieron y cuántas activaron, y
 * mandar la invitación una por una («Invitar a la siguiente»). Sólo para Directoras de paga (la API dice si aplica).
 */
const InvitationsSection = () => {
    const { data } = useUnitInvitations()
    const [active, setActive] = useState<string | null>(null)
    const [skipped, setSkipped] = useState<Set<string>>(new Set())
    const [listOpen, setListOpen] = useState(false)
    const [tab, setTab] = useState<InvitationStatus>('sin_invitar')
    const [search, setSearch] = useState('')

    const people = useMemo(() => data?.people ?? [], [data?.people])
    const queue = useMemo(() => people.filter(row => row.status === 'sin_invitar' && !skipped.has(row.id)), [people, skipped])
    const counts = useMemo(() => Object.fromEntries(TABS.map(item => [item.key, people.filter(row => row.status === item.key).length])) as Record<InvitationStatus, number>, [people])

    if (!data?.available) return null

    const next = queue.find(row => row.id !== active) ?? null
    const goNext = () => setActive(next?.id ?? null)
    const skip = () => {
        if (active) setSkipped(current => new Set(current).add(active))
        goNext()
    }

    const term = search.trim().toLocaleLowerCase('es-MX')
    const listed = people.filter(row => row.status === tab && (!term || row.name.toLocaleLowerCase('es-MX').includes(term)))
    const { totals } = data

    return (
        <>
            <section className="hoy-rise relative overflow-hidden rounded-[24px] bg-[linear-gradient(135deg,#4E31C0,#6C47FF_58%,#2CD4D9)] p-5 text-white shadow-[0_24px_50px_-30px_rgba(78,49,192,.9)] md:p-6">
                <div className="flex flex-wrap items-start justify-between gap-4">
                    <div className="max-w-[56ch]">
                        <p className="flex items-center gap-2 text-[11px] font-extrabold tracking-[.16em] uppercase opacity-90"><GiftIcon className="size-4" /> Invitar con regalo</p>
                        <h2 className="mt-1.5 text-[22px] leading-tight font-extrabold tracking-tight">Regálale a cada consultora un mes de «{data.gift.name}»</h2>
                        <p className="mt-1.5 text-[13.5px] leading-snug text-white/85">
                            Vale ${data.gift.value.toLocaleString('es-MX')} y va a tu nombre; a ti no te cuesta. Le llega una imagen con su nombre y su foto, y una liga a su estrategia del mes.
                        </p>
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-center">
                        {[['Invitadas', totals.invited], ['Abrieron', totals.opened], ['Activaron', totals.activated]].map(([label, value]) => (
                            <span key={label} className="grid min-w-[78px] rounded-2xl bg-white/12 px-3 py-2">
                                <b className="text-[22px] leading-none font-extrabold tabular-nums">{value}</b>
                                <small className="mt-1 text-[11px] font-bold text-white/80">{label}</small>
                            </span>
                        ))}
                    </div>
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                    {queue.length > 0 && (
                        <button type="button" onClick={() => setActive(queue[0].id)} className="flex h-11 cursor-pointer items-center gap-2 rounded-full bg-white px-5 text-[14px] font-extrabold text-[#4E31C0] shadow-sm hover:bg-white/90">
                            <GiftIcon className="size-4" /> {totals.invited ? 'Invitar a la siguiente' : 'Invitar a la primera'}
                            <span className="max-w-[16ch] truncate font-semibold text-[#4E31C0]/70">· {titleCaseName(queue[0].first_name)}</span>
                        </button>
                    )}
                    <button type="button" onClick={() => { setTab(queue.length ? 'sin_invitar' : 'invitada'); setListOpen(true) }} className="flex h-11 cursor-pointer items-center gap-2 rounded-full bg-white/14 px-5 text-[14px] font-bold text-white hover:bg-white/20">
                        <UsersIcon className="size-4" /> Ver a quién {totals.to_invite ? `· faltan ${totals.to_invite}` : ''}
                    </button>
                </div>
            </section>

            <Panel open={listOpen} onClose={() => setListOpen(false)} title="Tus invitaciones" description={`${totals.unit} consultoras en tu unidad · ${totals.activated} activaron su regalo`} className="sm:max-w-[620px]">
                <div className="sticky top-0 z-[1] -mx-1 grid gap-2 bg-background/95 px-1 pb-3 backdrop-blur">
                    <div className="flex gap-1.5 overflow-x-auto pb-0.5">
                        {TABS.map(item => (
                            <button key={item.key} type="button" onClick={() => setTab(item.key)} className={cn('h-8 shrink-0 cursor-pointer rounded-full px-3 text-[12.5px] font-bold transition-colors', tab === item.key ? 'bg-[#6C47FF] text-white' : 'bg-foreground/5 text-muted-foreground hover:text-foreground')}>
                                {item.label} <span className="opacity-75">{counts[item.key]}</span>
                            </button>
                        ))}
                    </div>
                    <label className="flex h-10 items-center gap-2 rounded-xl border border-border bg-card/60 px-3 text-[13px] focus-within:border-[#6C47FF]/50">
                        <SearchIcon className="size-4 text-muted-foreground" />
                        <input value={search} onChange={event => setSearch(event.target.value)} placeholder="Buscar por nombre" className="w-full bg-transparent outline-none placeholder:text-muted-foreground" />
                    </label>
                </div>

                {listed.length === 0 ? (
                    <p className="py-10 text-center text-[13px] text-muted-foreground">{term ? 'Nadie con ese nombre aquí.' : 'Nadie en esta lista todavía.'}</p>
                ) : (
                    <ul className="grid gap-1.5">
                        {listed.map(row => {
                            const action = row.status === 'sin_invitar' ? 'Invitar' : row.status === 'invitada' || row.status === 'abrio' ? 'Recordarle' : null
                            return (
                                <li key={row.id} className="flex items-center gap-3 rounded-2xl px-2 py-2 hover:bg-foreground/[.03]">
                                    {row.photo
                                        ? <img src={row.photo} alt="" loading="lazy" className="size-10 shrink-0 rounded-xl object-cover" />
                                        : <span className="hoy-soft grid size-10 shrink-0 place-items-center rounded-xl text-[12.5px] font-extrabold text-primary">{initials(row.name)}</span>}
                                    <span className="min-w-0 flex-1">
                                        <b className="block truncate text-[13.5px] font-extrabold">{titleCaseName(row.name)}</b>
                                        <small className={cn('block truncate text-[12px]', row.status === 'sin_invitar' && row.has_orders ? 'font-semibold text-[#C0066A] dark:text-[#FF7AC0]' : 'text-muted-foreground')}>{detalle(row)}</small>
                                    </span>
                                    {action
                                        ? <button type="button" onClick={() => { setListOpen(false); setActive(row.id) }} className={cn('h-9 shrink-0 cursor-pointer rounded-full px-4 text-[12.5px] font-bold', action === 'Invitar' ? 'hoy-cta text-white' : 'border border-border hover:border-[#6C47FF]/40')}>{action}</button>
                                        : <span className={cn(TAG, row.status === 'activo' ? 'bg-emerald-500/14 text-emerald-700 dark:text-emerald-400' : 'bg-foreground/5 text-muted-foreground')}>{row.status === 'activo' ? 'Activó' : 'Ya la usa'}</span>}
                                </li>
                            )
                        })}
                    </ul>
                )}
            </Panel>

            <InviteDialog
                personId={active}
                gift={data.gift}
                remaining={queue.filter(row => row.id !== active).length}
                onClose={() => setActive(null)}
                onNext={goNext}
                onSkip={skip}
            />
        </>
    )
}

export default InvitationsSection

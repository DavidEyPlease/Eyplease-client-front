import { useState } from 'react'

import { CustomerOfClient } from '@/interfaces/customerOfClients'
import { useSales } from '@/hooks/useInventory'
import { titleCaseName } from '@/pages/Hoy/lib'
import { money, saleDayLabel } from '../format'
import Panel from './Panel'
import SaleDialog from './SaleDialog'
import SalesList from './SalesList'

const Tile = ({ value, label }: { value: string, label: string }) => (
    <div className="flex-1 rounded-2xl bg-foreground/[0.04] px-2 py-3 text-center">
        <b className="block text-[18px] leading-none font-extrabold">{value}</b>
        <small className="mt-1 block text-[10px] font-bold tracking-wide text-muted-foreground uppercase">{label}</small>
    </div>
)

/**
 * Lo que le ha comprado una clienta de Mis Clientas (anotado con «Ya me compró») y anotarle otra compra. De este
 * historial salen los «vuelve a ofrecerle» de su estrategia.
 */
const CustomerSalesDialog = ({ customer, onClose }: { customer: CustomerOfClient | null, onClose: () => void }) => {
    const [selling, setSelling] = useState(false)
    const sales = useSales({ clientCustomerId: customer?.id ?? null, perPage: 50, enabled: !!customer })
    const items = sales.data?.items ?? []
    const spent = items.reduce((sum, sale) => sum + sale.total, 0)

    return (
        <>
            <Panel
                open={!!customer && !selling}
                onClose={onClose}
                title={customer ? titleCaseName(customer.name) : ''}
                description="Sus compras, anotadas con «Ya me compró»."
                className="sm:max-w-[520px]"
                footer={
                    <button type="button" onClick={() => setSelling(true)} className="hoy-cta flex h-12 w-full cursor-pointer items-center justify-center rounded-full text-[14.5px] font-bold text-white">
                        Ya me compró · anotar una compra
                    </button>
                }
            >
                <div className="flex gap-2">
                    <Tile value={String(sales.data?.total_items ?? 0)} label={sales.data?.total_items === 1 ? 'compra' : 'compras'} />
                    <Tile value={money(spent)} label="te ha comprado" />
                    <Tile value={items[0] ? saleDayLabel(items[0].sold_at, true) : '—'} label="la última" />
                </div>
                <p className="mt-5 mb-1 text-[11px] font-extrabold tracking-wider text-muted-foreground uppercase">Sus compras</p>
                {sales.isLoading ? (
                    <div className="hoy-skel h-20 rounded-2xl" />
                ) : items.length ? (
                    <SalesList sales={items} />
                ) : (
                    <p className="rounded-2xl border border-dashed border-border px-4 py-5 text-center text-[13px] leading-snug text-muted-foreground">
                        Todavía no le anotas compras. Cuando te compre, anótalo aquí: lo bajo de tu inventario y te aviso cuándo volver a ofrecerle.
                    </p>
                )}
            </Panel>
            <SaleDialog open={!!customer && selling} onClose={() => setSelling(false)} customer={customer ? { id: customer.id, name: customer.name } : null} />
        </>
    )
}

export default CustomerSalesDialog

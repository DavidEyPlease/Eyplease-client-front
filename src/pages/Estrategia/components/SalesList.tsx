import { useState } from 'react'
import { Loader2Icon, SendIcon, Trash2Icon } from 'lucide-react'
import { toast } from 'sonner'

import { CustomerSale } from '@/interfaces/inventory'
import { useSaleActions } from '@/hooks/useInventory'
import { titleCaseName } from '@/pages/Hoy/lib'
import { friendlyError, money, pieces, saleDayLabel } from '../format'

const itemsLine = (sale: CustomerSale) => sale.items.map(item => `${pieces(item.quantity)} × ${item.name}`).join(' · ')

interface Props {
    sales: CustomerSale[]
    showCustomer?: boolean
    /** «Mándale cómo usarlo» en las ventas que lo tienen (sin él, no se enseña) */
    onHowTo?: (sale: CustomerSale) => void
}

/**
 * Ventas anotadas con «Ya me compró». Una mal anotada se borra (se confirma ahí mismo) y lo que bajó regresa. Las que
 * tienen su «cómo usarlo» traen el acceso para mandárselo a la clienta después.
 */
const SalesList = ({ sales, showCustomer = false, onHowTo }: Props) => {
    const { remove } = useSaleActions()
    const [asking, setAsking] = useState<string | null>(null)

    const onDelete = (sale: CustomerSale) => remove.mutate(sale.id, {
        onSuccess: () => { setAsking(null); toast.success('Venta borrada: lo vendido regresó a tu inventario.') },
        onError: error => toast.error(friendlyError(error, 'No se pudo borrar. Intenta de nuevo.')),
    })

    return (
        <div>
            {sales.map(sale => (
                <div key={sale.id} className="flex items-start gap-3 border-b border-border py-2.5 last:border-b-0">
                    <span className="min-w-0 flex-1">
                        <span className="flex items-baseline gap-2">
                            <b className="truncate text-[13.5px] font-bold">{showCustomer ? titleCaseName(sale.customer_name) : saleDayLabel(sale.sold_at)}</b>
                            {showCustomer && <small className="shrink-0 text-[11.5px] font-semibold text-muted-foreground">{saleDayLabel(sale.sold_at)}</small>}
                        </span>
                        <span className="block text-[12px] leading-snug text-muted-foreground">{itemsLine(sale)}</span>
                        {onHowTo && !!sale.howto?.slides.length && asking !== sale.id && (
                            <button type="button" onClick={() => onHowTo(sale)} className="mt-1.5 inline-flex h-8 cursor-pointer items-center gap-1.5 rounded-full bg-[#6C47FF]/10 px-3 text-[12px] font-bold text-[#4E31C0] hover:bg-[#6C47FF]/15 dark:text-[#BBAAFF]">
                                <SendIcon className="size-3.5" /> Mándale cómo usarlo
                            </button>
                        )}
                    </span>
                    {asking === sale.id ? (
                        <span className="flex shrink-0 items-center gap-1.5">
                            <small className="text-[11.5px] text-muted-foreground">¿Borrarla?</small>
                            <button type="button" onClick={() => onDelete(sale)} disabled={remove.isPending} className="h-8 cursor-pointer rounded-full bg-[#E5484D] px-3 text-[12px] font-bold text-white">
                                {remove.isPending ? <Loader2Icon className="size-4 animate-spin" /> : 'Sí, borrar'}
                            </button>
                            <button type="button" onClick={() => setAsking(null)} className="h-8 cursor-pointer rounded-full px-2.5 text-[12px] font-semibold text-muted-foreground hover:bg-foreground/5">No</button>
                        </span>
                    ) : (
                        <>
                            <b className="shrink-0 pt-0.5 text-[13.5px] font-extrabold tabular-nums">{money(sale.total)}</b>
                            <button type="button" aria-label={`Borrar la venta de ${sale.customer_name}`} title="Borrar esta venta (lo vendido regresa a tu inventario)" onClick={() => setAsking(sale.id)} className="grid size-8 shrink-0 cursor-pointer place-items-center rounded-full text-muted-foreground transition-colors hover:bg-foreground/5 hover:text-foreground">
                                <Trash2Icon className="size-4" />
                            </button>
                        </>
                    )}
                </div>
            ))}
        </div>
    )
}

export default SalesList

import { Share2Icon } from 'lucide-react'

import { InventoryItem } from '@/interfaces/inventory'
import { dayLabel, money, pieces, storedLabel } from '../format'
import { Chip } from './Chips'
import ProductShape from './ProductShape'
import Stepper from './Stepper'

/** En qué parte del inventario va: lo de pedidos anteriores, lo del último pedido, lo que agregó ella o lo agotado. */
export type ItemGroup = 'older' | 'last' | 'manual' | 'out'

const detailOf = (item: InventoryItem, group: ItemGroup) => {
    const bought = item.purchased > 0 ? `compraste ${pieces(item.purchased)}` : null
    if (group === 'older') return [item.oldest_unit_at ? `del ${dayLabel(item.oldest_unit_at)}` : null, storedLabel(item.days_stored), bought]
    if (group === 'manual') return ['lo agregaste tú', item.price ? `${money(item.price)} c/u` : 'sin precio']
    if (group === 'out') return ['se te acabó', bought]
    return [`${money(item.price)} c/u`, bought]
}

interface Props {
    item: InventoryItem
    group: ItemGroup
    onStep: (delta: 1 | -1) => void
    /** «Compartir»: sólo sale si el producto ya tiene su imagen (`piece`) y le queda */
    onShare?: (item: InventoryItem) => void
}

const ItemRow = ({ item, group, onStep, onShare }: Props) => {
    const gain = group !== 'out' && item.profit_per_unit !== null && item.profit_per_unit > 0
    // «Lo tengo para entrega inmediata»: no se ofrece lo que ya se le acabó
    const share = !!onShare && !!item.piece && group !== 'out' && item.on_hand > 0
    return (
        <div className="flex items-center gap-3 border-b border-border py-2.5 last:border-b-0">
            <ProductShape name={item.name} />
            <span className="min-w-0 flex-1">
                <b className="block text-[13.5px] leading-snug font-bold">{item.name}</b>
                {item.shade && <span className="block truncate text-[11.5px] font-semibold text-muted-foreground">{item.shade}</span>}
                <span className="block text-[11.5px] leading-snug text-muted-foreground">{detailOf(item, group).filter(Boolean).join(' · ')}</span>
                {(item.stale || item.is_ordena_ya || gain || share) && (
                    <span className="mt-1 flex flex-wrap items-center gap-1">
                        {item.stale && <Chip tone="magenta">Muévelo primero</Chip>}
                        {item.is_ordena_ya && <Chip tone="violet">Ordena Ya</Chip>}
                        {gain && <Chip tone="green">ganas {money(item.profit_per_unit ?? 0)} c/u</Chip>}
                        {share && (
                            <button type="button" onClick={() => onShare?.(item)} aria-label={`Compartir ${item.name}`}
                                className="inline-flex h-[24px] cursor-pointer items-center gap-1 rounded-full border border-[#6C47FF]/45 bg-card px-2.5 text-[11px] font-bold text-[#4E31C0] transition-colors hover:bg-[#6C47FF]/10 dark:text-[#BBAAFF]">
                                <Share2Icon className="size-3" /> Compartir
                            </button>
                        )}
                    </span>
                )}
            </span>
            <Stepper value={item.on_hand} onStep={onStep} label={item.name} />
        </div>
    )
}

export default ItemRow

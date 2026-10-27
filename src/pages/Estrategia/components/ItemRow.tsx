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

const ItemRow = ({ item, group, onStep }: { item: InventoryItem, group: ItemGroup, onStep: (delta: 1 | -1) => void }) => {
    const gain = group !== 'out' && item.profit_per_unit !== null && item.profit_per_unit > 0
    return (
        <div className="flex items-center gap-3 border-b border-border py-2.5 last:border-b-0">
            <ProductShape name={item.name} />
            <span className="min-w-0 flex-1">
                <b className="block text-[13.5px] leading-snug font-bold">{item.name}</b>
                {item.shade && <span className="block truncate text-[11.5px] font-semibold text-muted-foreground">{item.shade}</span>}
                <span className="block text-[11.5px] leading-snug text-muted-foreground">{detailOf(item, group).filter(Boolean).join(' · ')}</span>
                {(item.stale || item.is_ordena_ya || gain) && (
                    <span className="mt-1 flex flex-wrap gap-1">
                        {item.stale && <Chip tone="magenta">Muévelo primero</Chip>}
                        {item.is_ordena_ya && <Chip tone="violet">Ordena Ya</Chip>}
                        {gain && <Chip tone="green">ganas {money(item.profit_per_unit ?? 0)} c/u</Chip>}
                    </span>
                )}
            </span>
            <Stepper value={item.on_hand} onStep={onStep} label={item.name} />
        </div>
    )
}

export default ItemRow

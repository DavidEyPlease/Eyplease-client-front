import { FormEvent, useEffect, useState } from 'react'
import { Loader2Icon } from 'lucide-react'
import { toast } from 'sonner'

import { InventoryItem } from '@/interfaces/inventory'
import { friendlyError, parseAmount } from '../format'
import Field from './Field'
import Panel from './Panel'

interface Props {
    /** El producto que agregó ella; nulo = cerrada */
    item: InventoryItem | null
    onClose: () => void
    onSave: (sku: string, price: number) => Promise<unknown>
    saving: boolean
}

/**
 * Ponerle o corregirle el precio a un producto que agregó ella (Norma bul814 tenía 4 sin precio y no había cómo). Lo que
 * viene de sus pedidos trae el precio de lista de Mary Kay y aquí no se toca.
 */
const ItemPriceDialog = ({ item, onClose, onSave, saving }: Props) => {
    const [value, setValue] = useState('')
    const sku = item?.sku ?? null

    useEffect(() => {
        setValue(item?.price ? String(item.price) : '')
        // eslint-disable-next-line react-hooks/exhaustive-deps -- sólo al abrir otro producto; después manda lo que ella escribe
    }, [sku])

    if (!item) return null

    const price = parseAmount(value)
    const valid = price !== null && price >= 1 && price <= 100000

    const save = async (event: FormEvent) => {
        event.preventDefault()
        if (!valid || saving) return
        try {
            await onSave(item.sku, price)
            toast.success('Listo, ya tiene su precio.')
            onClose()
        } catch (error) {
            toast.error(friendlyError(error, 'No se guardó el precio. Intenta de nuevo.'))
        }
    }

    return (
        <Panel open onClose={onClose} title={item.price ? 'Cambiar precio' : 'Ponle precio'} description={item.name}>
            <form onSubmit={save} className="flex flex-col gap-3">
                <Field label="Precio para tu clienta" value={value} onChange={setValue} inputMode="decimal" prefix="$" placeholder="0" autoFocus />
                <button type="submit" disabled={!valid || saving} className="flex h-11 w-full cursor-pointer items-center justify-center rounded-full bg-[#4E31C0] px-5 text-[14px] font-bold text-white disabled:cursor-default disabled:opacity-50">
                    {saving ? <Loader2Icon className="size-4 animate-spin" /> : 'Guardar precio'}
                </button>
            </form>
        </Panel>
    )
}

export default ItemPriceDialog

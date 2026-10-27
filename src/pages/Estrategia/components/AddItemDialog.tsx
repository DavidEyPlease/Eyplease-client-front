import { useEffect, useState } from 'react'
import { Loader2Icon } from 'lucide-react'
import { toast } from 'sonner'

import { NewInventoryItemPayload } from '@/interfaces/inventory'
import { friendlyError, parseAmount } from '../format'
import Field from './Field'
import Panel from './Panel'
import Stepper from './Stepper'

interface Props {
    open: boolean
    onClose: () => void
    onSave: (payload: NewInventoryItemPayload) => Promise<unknown>
    saving: boolean
}

/** «+ Agregar algo que no sale en tus pedidos»: lo compró antes de la ventana o fuera del portal. */
const AddItemDialog = ({ open, onClose, onSave, saving }: Props) => {
    const [name, setName] = useState('')
    const [quantity, setQuantity] = useState(1)
    const [price, setPrice] = useState('')

    useEffect(() => {
        if (!open) return
        setName('')
        setQuantity(1)
        setPrice('')
    }, [open])

    const valid = name.trim().length >= 2 && quantity > 0

    const submit = async () => {
        if (!valid) return
        const amount = parseAmount(price)
        try {
            await onSave({ name: name.trim(), quantity, ...(amount !== null ? { price: amount } : {}) })
            toast.success(`Listo: ${name.trim()} ya está en tu inventario.`)
            onClose()
        } catch (error) {
            toast.error(friendlyError(error, 'No se pudo agregar. Intenta de nuevo.'))
        }
    }

    return (
        <Panel
            open={open}
            onClose={onClose}
            title="Agregar a tu inventario"
            description="Lo que tienes y no sale en tus pedidos de los últimos meses. Tus pedidos nuevos se suman solos."
            className="sm:max-w-[460px]"
            footer={
                <button type="button" disabled={!valid || saving} onClick={submit} className="hoy-cta flex h-12 w-full cursor-pointer items-center justify-center rounded-full text-[14.5px] font-bold text-white disabled:cursor-default disabled:opacity-50">
                    {saving ? <Loader2Icon className="size-5 animate-spin" /> : 'Agregar a mi inventario'}
                </button>
            }
        >
            <div className="grid gap-3">
                <Field label="¿Qué producto es?" value={name} onChange={setName} placeholder="Ej. Crema de Noche TimeWise" autoFocus />
                <div className="flex items-center justify-between rounded-[14px] border-[1.5px] border-border bg-card px-3 py-2">
                    <small className="text-[10.5px] font-bold tracking-wider text-muted-foreground uppercase">¿Cuántas tienes?</small>
                    <Stepper value={quantity} min={1} onChange={setQuantity} label="piezas" />
                </div>
                <Field label="Precio para tu clienta (opcional)" value={price} onChange={setPrice} placeholder="Precio de catálogo, con IVA" inputMode="decimal" prefix="$" />
                <p className="px-1 text-[12px] leading-snug text-muted-foreground">Sin factura no sabemos cuánto te costó: su ganancia no entra en tu cuenta.</p>
            </div>
        </Panel>
    )
}

export default AddItemDialog

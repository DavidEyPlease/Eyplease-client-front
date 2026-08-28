import { useEffect, useState } from 'react'
import { FileTextIcon, ImageIcon, UploadCloudIcon, XIcon } from 'lucide-react'

import Button from '@/components/common/Button'
import Modal from '@/components/common/Modal'
import FileSelector from '@/components/generics/FileSelector'
import { Input } from '@/components/ui/input'
import { IBillingPaymentMethod, PaymentMethod } from '@/interfaces/billing'
import { cn } from '@/lib/utils'
import { formatCurrency } from '@/utils'
import PaymentAccounts from './PaymentAccounts'
import useReceiptUpload from './useReceiptUpload'
import { periodLabel, RECEIPT_ACCEPTED_FILES, RECEIPT_METHODS } from './utils'

interface Props {
    open: boolean
    /** Periodo al que se le sube el comprobante y cuánto queda por cubrir. */
    period: string
    amount: number
    currency: string
    /** Se muestran las cuentas de cobro cuando el pago es manual, para transferir sin salir. */
    paymentMethod?: IBillingPaymentMethod
    onOpenChange: (open: boolean) => void
}

const isImage = (file: File) => file.type.startsWith('image/')

/**
 * Comprobante de un periodo: a dónde pagar, qué archivo se envía y con qué
 * referencia. El pago queda en revisión hasta que un administrador lo valide,
 * y así se le dice al cliente para que no lo dé por saldado.
 */
const UploadReceiptDialog = ({ open, period, amount, currency, paymentMethod, onOpenChange }: Props) => {
    const [file, setFile] = useState<File | null>(null)
    const [preview, setPreview] = useState<string | null>(null)
    const [reference, setReference] = useState('')
    const [method, setMethod] = useState<PaymentMethod>(PaymentMethod.TRANSFER)

    const { uploading, upload } = useReceiptUpload({ onUploaded: () => onOpenChange(false) })

    /* La vista previa es una URL de objeto: hay que revocarla al cambiar de archivo */
    useEffect(() => {
        if (!file || !isImage(file)) return setPreview(null)

        const url = URL.createObjectURL(file)
        setPreview(url)

        return () => URL.revokeObjectURL(url)
    }, [file])

    /* Al cerrar se limpia todo: el siguiente periodo no hereda el archivo anterior */
    useEffect(() => {
        if (open) return

        setFile(null)
        setReference('')
        setMethod(PaymentMethod.TRANSFER)
    }, [open])

    const onSubmit = async () => {
        if (!file) return

        await upload(period, file, reference, method)
    }

    return (
        <Modal
            open={open}
            onOpenChange={onOpenChange}
            size="md"
            title="Subir comprobante"
            description={`Pago de ${periodLabel(period)} · ${formatCurrency(amount, currency)}`}
            footer={
                <>
                    <button
                        type="button"
                        disabled={uploading}
                        onClick={() => onOpenChange(false)}
                        className="cursor-pointer px-2 text-[12.5px] font-semibold text-muted-foreground transition-colors hover:text-foreground disabled:opacity-50"
                    >
                        Cancelar
                    </button>
                    <Button
                        text={uploading ? 'Enviando…' : 'Enviar comprobante'}
                        className="py-2.5 text-sm"
                        loading={uploading}
                        disabled={!file || uploading}
                        onClick={onSubmit}
                    />
                </>
            }
        >
            <div className="flex flex-col gap-4">
                {paymentMethod?.type === 'manual' && (
                    <section className="flex flex-col gap-2">
                        <h4 className="text-[11px] font-bold tracking-wider text-muted-foreground uppercase">Paga a</h4>
                        <PaymentAccounts accounts={paymentMethod.accounts} instructions={paymentMethod.instructions} />
                    </section>
                )}

                <section className="flex flex-col gap-2">
                    <h4 className="text-[11px] font-bold tracking-wider text-muted-foreground uppercase">Cómo pagaste</h4>
                    <div className="flex gap-2">
                        {RECEIPT_METHODS.map(option => (
                            <button
                                key={option.value}
                                type="button"
                                aria-pressed={method === option.value}
                                onClick={() => setMethod(option.value)}
                                className={cn(
                                    'flex-1 cursor-pointer rounded-xl border px-3 py-2 text-[12.5px] font-bold transition-all',
                                    method === option.value
                                        ? 'border-primary bg-primary/[0.08] text-primary'
                                        : 'text-muted-foreground hover:bg-surface-soft hover:text-foreground',
                                )}
                            >
                                {option.label}
                            </button>
                        ))}
                    </div>
                </section>

                <section className="flex flex-col gap-2">
                    <h4 className="text-[11px] font-bold tracking-wider text-muted-foreground uppercase">Comprobante</h4>

                    {file ? (
                        <div className="flex items-center gap-3 rounded-xl border bg-card p-2.5">
                            {preview ? (
                                <img src={preview} alt="Vista previa del comprobante" className="size-14 shrink-0 rounded-lg object-cover" />
                            ) : (
                                <span className="grid size-14 shrink-0 place-content-center rounded-lg bg-primary/[0.08] text-primary [&>svg]:size-5">
                                    {isImage(file) ? <ImageIcon aria-hidden /> : <FileTextIcon aria-hidden />}
                                </span>
                            )}
                            <span className="min-w-0 flex-1">
                                <span className="block truncate text-[12.5px] font-bold tracking-tight">{file.name}</span>
                                <span className="block text-[11px] font-semibold text-muted-foreground">
                                    {(file.size / 1024 / 1024).toFixed(2)} MB
                                </span>
                            </span>
                            <button
                                type="button"
                                aria-label="Quitar archivo"
                                disabled={uploading}
                                onClick={() => setFile(null)}
                                className="grid size-8 shrink-0 cursor-pointer place-content-center rounded-lg text-muted-foreground transition-colors hover:bg-surface-soft hover:text-foreground disabled:opacity-50"
                            >
                                <XIcon className="size-4" />
                            </button>
                        </div>
                    ) : (
                        <FileSelector
                            fileAccepts={RECEIPT_ACCEPTED_FILES}
                            disabled={uploading}
                            onSelectedFile={setFile}
                            fileUploaderComponent={
                                <div className="flex cursor-pointer flex-col items-center gap-1.5 rounded-xl border border-dashed px-4 py-6 text-center transition-colors hover:border-primary/40 hover:bg-surface-soft">
                                    <UploadCloudIcon className="size-6 text-primary" aria-hidden />
                                    <span className="text-[12.5px] font-bold tracking-tight">Selecciona tu comprobante</span>
                                    <span className="text-[11px] font-semibold text-muted-foreground">Imagen o PDF</span>
                                </div>
                            }
                        />
                    )}
                </section>

                <section className="flex flex-col gap-2">
                    <label htmlFor="reference-number" className="text-[11px] font-bold tracking-wider text-muted-foreground uppercase">
                        Número de referencia <span className="normal-case">(opcional)</span>
                    </label>
                    <Input
                        id="reference-number"
                        maxLength={60}
                        placeholder="Folio o referencia de la operación"
                        className="h-10 text-[13px]"
                        value={reference}
                        onChange={event => setReference(event.target.value)}
                    />
                </section>

                <p className="rounded-xl bg-surface-soft px-3.5 py-3 text-[11.5px] font-medium text-muted-foreground">
                    Tu pago quedará <strong className="font-bold text-foreground">en revisión</strong> hasta que confirmemos el comprobante.
                </p>
            </div>
        </Modal>
    )
}

export default UploadReceiptDialog

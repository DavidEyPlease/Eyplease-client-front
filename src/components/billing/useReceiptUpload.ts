import { useState } from 'react'
import { toast } from 'sonner'

import { API_ROUTES } from '@/constants/api'
import useFiles from '@/hooks/useFiles'
import useRequestQuery from '@/hooks/useRequestQuery'
import { IUploadReceiptPayload, PaymentMethod } from '@/interfaces/billing'
import { FileTypes } from '@/interfaces/files'
import { sanitizeFileName } from '@/utils'
import { billingOverviewKey, billingPaymentsKey, RECEIPT_MAX_SIZE_MB } from './utils'

interface Options {
    /** Se ejecuta con el comprobante ya registrado en la API. */
    onUploaded?: () => void
}

const BYTES_PER_MB = 1024 * 1024

/**
 * Subir el comprobante de un periodo: primero el archivo a S3 con URL firmada y
 * después el registro contra la API, que deja el pago en revisión.
 *
 * El orden importa: el endpoint solo acepta la clave de S3, así que si la subida
 * falla el pago ni se toca.
 */
const useReceiptUpload = ({ onUploaded }: Options = {}) => {
    const { onUploadFile } = useFiles()
    const [uploading, setUploading] = useState(false)

    const { request } = useRequestQuery({
        invalidateQueries: [billingOverviewKey, billingPaymentsKey],
        onSuccess: () => {
            toast.success('Comprobante enviado. Lo validaremos en breve')
            onUploaded?.()
        },
    })

    /** @returns true si el comprobante quedó registrado */
    const upload = async (periods: string[], file: File, reference: string, method: PaymentMethod): Promise<boolean> => {
        if (file.size > RECEIPT_MAX_SIZE_MB * BYTES_PER_MB) {
            toast.error(`El archivo supera los ${RECEIPT_MAX_SIZE_MB} MB`)
            return false
        }

        setUploading(true)
        let receiptUri = ''

        try {
            const extension = file.name.split('.').pop() ?? 'jpg'

            await onUploadFile({
                file,
                fileType: FileTypes.PAYMENT_RECEIPT,
                /* Nombre propio por carga: dos comprobantes del mismo mes no se pisan */
                filename: `${sanitizeFileName(periods[0])}${periods.length > 1 ? `-x${periods.length}` : ''}-${Date.now()}.${extension}`,
                callback: async (uri: string) => {
                    receiptUri = uri
                },
            })

            if (!receiptUri) return false

            const payload: IUploadReceiptPayload = {
                periods,
                receipt_uri: receiptUri,
                ...(reference.trim() ? { reference_number: reference.trim() } : {}),
                ...(method === PaymentMethod.TRANSFER || method === PaymentMethod.CASH ? { method } : {}),
            }

            await request('POST', API_ROUTES.BILLING.UPLOAD_RECEIPTS, payload)

            return true
        } catch {
            /* El toast del error lo emite useRequestQuery */
            return false
        } finally {
            setUploading(false)
        }
    }

    return { uploading, upload }
}

export default useReceiptUpload

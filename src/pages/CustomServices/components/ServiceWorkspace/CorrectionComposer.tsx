import { SendIcon } from 'lucide-react'
import { toast } from 'sonner'
import z, { object, string } from 'zod'

import Button from '@/components/common/Button'
import { Textarea } from '@/components/ui/textarea'
import { API_ROUTES } from '@/constants/api'
import useCustomForm from '@/hooks/useCustomForm'
import useRequestQuery from '@/hooks/useRequestQuery'
import { queryKeys } from '@/utils/cache'

export const RequestCorrectionFormSchema = object({
    comment: string().nonempty().max(255)
})

export type RequestCorrectionFormData = z.infer<typeof RequestCorrectionFormSchema>

const COMMENT_MAX_LENGTH = 255

interface Props {
    itemId: string
}

/** Redactor de correcciones: siempre visible al pie del workspace. */
const CorrectionComposer = ({ itemId }: Props) => {
    const {
        register,
        handleSubmit,
        reset: formReset,
    } = useCustomForm<RequestCorrectionFormData>(RequestCorrectionFormSchema, {})

    const { request, requestState } = useRequestQuery({
        invalidateQueries: [queryKeys.list('service-request/activity', { itemId })],
        onSuccess: () => {
            formReset()
            toast.success('Solicitud de corrección enviada con éxito')
        }
    })

    const onSubmit = handleSubmit(async (data) =>
        request('POST', API_ROUTES.CUSTOM_SERVICES.REQUEST_CORRECTION.replace('{id}', itemId), data)
    )

    return (
        <form className="flex flex-col gap-2 rounded-2xl border bg-card p-3" onSubmit={onSubmit}>
            <Textarea
                placeholder="¿Algo que corregir? Cuéntale al equipo de diseño qué cambiar de esta versión…"
                maxLength={COMMENT_MAX_LENGTH}
                className="min-h-20 resize-none"
                {...register('comment')}
            />
            <div className="flex items-center justify-between gap-3">
                <span className="text-[10.5px] font-semibold text-muted-foreground">Máx. {COMMENT_MAX_LENGTH} caracteres</span>
                <Button
                    type="submit"
                    size="sm"
                    rounded
                    loading={requestState.loading}
                    text={<><SendIcon className="size-3.5" />Enviar corrección</>}
                />
            </div>
        </form>
    )
}

export default CorrectionComposer

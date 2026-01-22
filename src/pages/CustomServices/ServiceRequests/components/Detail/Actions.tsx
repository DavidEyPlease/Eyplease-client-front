import z, { object, string } from 'zod'

import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import useRequestQuery from '@/hooks/useRequestQuery'
import { API_ROUTES } from '@/constants/api'
import useCustomForm from '@/hooks/useCustomForm'
import Button from '@/components/common/Button'
import { PencilLineIcon } from 'lucide-react'
import { queryKeys } from '@/utils/cache'
import { toast } from 'sonner'

export const RequestCorrectionFormSchema = object({
    comment: string().nonempty().max(255)
})

export type RequestCorrectionFormData = z.infer<typeof RequestCorrectionFormSchema>

interface ServiceActionsProps {
    itemId: string
}

const ServiceActions = ({ itemId }: ServiceActionsProps) => {
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

    const onSubmit = handleSubmit(async (data) => request('POST', API_ROUTES.CUSTOM_SERVICES.REQUEST_CORRECTION.replace('{id}', itemId), data))

    return (
        <form className="flex flex-col gap-4" onSubmit={onSubmit}>
            <div>
                <Label className="mb-2">Solicitar corrección</Label>
                <Textarea
                    placeholder="Describe los cambios que necesitas (p. ej. ajustar tipografía, cambiar color, etc.)"
                    {...register('comment')}
                />
            </div>
            <Button
                text={
                    <div className="flex items-center gap-2">
                        <PencilLineIcon />
                        Enviar solicitud de corrección
                    </div>
                }
                className='w-max'
                type="submit"
                color="primary"
                rounded
                loading={requestState.loading}
            />
        </form>
    )
}

export default ServiceActions

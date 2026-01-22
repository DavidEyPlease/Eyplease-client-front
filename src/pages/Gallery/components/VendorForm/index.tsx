import {
    ToggleGroup,
    ToggleGroupItem,
} from "@/components/ui/toggle-group"

import Button from "@/components/common/Button"
import TextInput from "@/components/common/Inputs/TextInput"
import useCustomForm from "@/hooks/useCustomForm"
import { SponsoredFormData, SponsoredSchema } from "./schema"
import { ISponsored } from "@/interfaces/sponsored"
import { Gender } from "@/interfaces/common"
import { API_ROUTES } from "@/constants/api"
import { toast } from "sonner"
import { publishEvent } from "@/utils/events"
import useRequestQuery from "@/hooks/useRequestQuery"
import { BROWSER_EVENTS } from "@/constants/app"

interface Props {
    sponsored: ISponsored
    onSuccess?: () => void
}

const VendorForm = ({ sponsored, onSuccess }: Props) => {

    const {
        register,
        handleSubmit,
        setValue,
        watch,
        formState: { errors },
    } = useCustomForm<SponsoredFormData>(SponsoredSchema, sponsored)
    const { request, requestState } = useRequestQuery()

    const onSubmit = handleSubmit(async (data) => {
        try {
            const response = await request<SponsoredFormData, ISponsored>('PUT', API_ROUTES.SPONSORED.UPDATE.replace('{id}', sponsored.id), data)
            if (response.success) {
                toast.success('Datos actualizados correctamente')
                publishEvent(BROWSER_EVENTS.GALLERY_LIST_UPDATED, { data: response.data, action: 'updated' })
                onSuccess?.()
            }
        } catch (error) {
            console.error(error)
        }
    })

    return (
        <form onSubmit={onSubmit}>
            <div className="flex flex-col gap-5 mx-auto mb-16">
                <TextInput
                    label="Nombre Completo"
                    register={register('name')}
                    error={errors.name?.message}
                />

                <ToggleGroup type="single" variant="outline" value={watch('gender')?.toString()} onValueChange={e => setValue('gender', e as Gender)}>
                    <ToggleGroupItem value={Gender.MALE} aria-label="Masculino">
                        Masculino
                    </ToggleGroupItem>
                    <ToggleGroupItem value={Gender.FEMALE} aria-label="Femenino">
                        Femenino
                    </ToggleGroupItem>
                </ToggleGroup>
            </div>

            <Button
                text='Guardar'
                type="submit"
                color="primary"
                rounded
                block
                loading={requestState.loading}
            />
        </form>
    )
}

export default VendorForm
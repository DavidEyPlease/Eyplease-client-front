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
import useRequestQuery from "@/hooks/useRequestQuery"

/** Lo mínimo para editar a una persona: Galería pasa su vendedora entera y Mi unidad sólo esto. */
export interface VendorFormPerson {
    id: string
    name: string
    /** Sin dato (null o ausente), el selector arranca vacío y no se manda: se queda el que tiene */
    gender?: Gender | null
}

interface Props {
    sponsored: VendorFormPerson
    /** Con lo guardado (lo que contestó la API sobre lo que se mandó), para que quien abrió el formulario refresque su lista */
    onSuccess?: (updated: Partial<ISponsored>) => void
}

const VendorForm = ({ sponsored, onSuccess }: Props) => {

    const {
        register,
        handleSubmit,
        setValue,
        watch,
        formState: { errors },
    } = useCustomForm<SponsoredFormData>(SponsoredSchema, { name: sponsored.name, gender: sponsored.gender ?? null })
    const { request, requestState } = useRequestQuery()

    const onSubmit = handleSubmit(async (data) => {
        try {
            /* El sexo sólo va si hay uno elegido: la API rechaza `gender: null` («filled») */
            const body = { name: data.name, ...(data.gender ? { gender: data.gender } : {}) }
            const response = await request<SponsoredFormData, ISponsored>('PUT', API_ROUTES.SPONSORED.UPDATE.replace('{id}', sponsored.id), body)
            if (response.success) {
                toast.success('Datos actualizados correctamente')
                onSuccess?.({ ...body, ...response.data })
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

                {/* Volver a tocar el elegido lo deja vacío: se ignora, el sexo no se borra */}
                <ToggleGroup type="single" variant="outline" value={watch('gender')?.toString() ?? ''} onValueChange={e => { if (e) setValue('gender', e as Gender) }}>
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

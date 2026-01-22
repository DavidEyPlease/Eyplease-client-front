import useCustomForm from "@/hooks/useCustomForm"
import { CustomServiceFormData, CustomServiceFormSchema } from "./form"
import TextInput from "@/components/common/Inputs/TextInput"
import { Textarea } from "@/components/ui/textarea"
import Button from "@/components/common/Button"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import useRequestQuery from "@/hooks/useRequestQuery"
import { API_ROUTES } from "@/constants/api"
import useAuthStore from "@/store/auth"
import Dropdown from "@/components/common/Inputs/Dropdown"
// import { Autocomplete } from "@/components/common/Inputs/Autocomplete"
// import Switch from "@/components/common/Inputs/Switch"
// import InfoTooltip from "@/components/generics/InfoTooltip"
// import { useState } from "react"
// import { SponsoredService } from "@/services/sponsored.service"
import { queryKeys } from "@/utils/cache"
import { useRequestServicesStore } from "@/store/request-services"
import { ApiResponse } from "@/interfaces/common"
import { UserRequestService } from "@/interfaces/requestService"

interface CustomServiceFormProps {
    item?: UserRequestService
    onHandleSuccess: () => void
}

const CustomServiceForm = ({ item, onHandleSuccess }: CustomServiceFormProps) => {
    // const [enableRelation, setEnableRelation] = useState(false)
    const { setSelectedItem } = useRequestServicesStore(state => state)
    const { utilData } = useAuthStore(state => state)

    const isEdit = Boolean(item)

    const {
        register,
        handleSubmit,
        setValue,
        watch,
        reset: formReset,
        formState: { errors },
    } = useCustomForm<CustomServiceFormData>(CustomServiceFormSchema, item ? {
        category: item.category_id,
        title: item.title,
        description: item.description,
        metadata: {
            primaryColor: item.metadata?.primaryColor || '',
            secondaryColor: item.metadata?.secondaryColor || '',
        }
    } : {})

    const { request, requestState } = useRequestQuery({
        invalidateQueries: [queryKeys.list("services")],
        onSuccess: (response: ApiResponse<UserRequestService>) => {
            formReset()
            if (response.success) {
                setSelectedItem(response.data)
            }
            onHandleSuccess()
        }
    })

    const onSubmit = handleSubmit(async (data) => {
        return request(isEdit ? 'PUT' : 'POST', isEdit ? API_ROUTES.CUSTOM_SERVICES.UPDATE.replace('{id}', item!.id) : API_ROUTES.CUSTOM_SERVICES.CREATE, data)
    })

    const taskCategories = (utilData.task_categories || []).filter(category => category.slug !== 'system_task')

    return (
        <form className="flex flex-col gap-4" onSubmit={onSubmit}>
            <div className="grid md:grid-cols-2 gap-4">
                <Dropdown
                    label="Servicio a solicitar"
                    placeholder="Selecciona un servicio"
                    value={watch('category')}
                    onChange={(value) => setValue('category', value)}
                    items={taskCategories.map(category => ({
                        value: category.id,
                        label: category.name
                    }))}
                />
            </div>

            <TextInput
                label="Título"
                register={register('title')}
                error={errors.title?.message}
            />

            <div>
                <Label className="mb-2">Descripción</Label>
                <Textarea
                    placeholder="Describe lo que necesitas, dimensiones, referencias, colores, etc."
                    {...register('description')}
                />
            </div>


            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                    <div className="flex items-end gap-3">
                        <input
                            id="color-primario"
                            type="color"
                            className="h-9 w-12 rounded border"
                            aria-label="Seleccionar color primario"
                            value={watch('metadata.primaryColor') || ''}
                            onChange={(e) => setValue('metadata.primaryColor', e.target.value)}
                        />
                        <TextInput
                            label="Color primario"
                            placeholder="#000000"
                            register={register('metadata.primaryColor')}
                            pattern="^#([0-9A-Fa-f]{6})$"
                            error={errors.metadata?.primaryColor?.message}
                        />
                    </div>
                </div>
                <div className="space-y-2">
                    <div className="flex items-end gap-3">
                        <input
                            id="color-secundario"
                            type="color"
                            className="h-9 w-12 rounded border"
                            aria-label="Seleccionar color secundario"
                            value={watch('metadata.secondaryColor') || ''}
                            onChange={(e) => setValue('metadata.secondaryColor', e.target.value)}
                        />
                        <TextInput
                            label="Color secundario"
                            placeholder="#999999"
                            register={register('metadata.secondaryColor')}
                            pattern="^#([0-9A-Fa-f]{6})$"
                            error={errors.metadata?.secondaryColor?.message}
                        />
                    </div>
                </div>
            </div>

            {/* <Separator />
            <div className="flex gap-x-2">
                <Switch
                    id="enableRelation"
                    label="Relacionar servicio a tu unidad"
                    onCheckedChange={(checked) => setEnableRelation(checked)}
                />
                <InfoTooltip>
                    <p className="text-center">Habilitar para relacionar este servicio <br /> con otros registros, por ejemplo personas de tu unidad.</p>
                </InfoTooltip>
            </div>

            {enableRelation && (
                <Autocomplete
                    label="Seleccionar relaciones"
                    placeholder="Buscar usuario..."
                    searchPlaceholder="Escribe para buscar usuarios..."
                    emptyText="Escribe para buscar usuarios"
                    value={''}
                    onValueChange={(value) => console.log(value as string)}
                    onSearch={search => SponsoredService.getSponsoredAutocomplete(search)}
                />
            )} */}

            <Separator />

            <Button
                text={isEdit ? 'Guardar cambios' : 'Crear solicitud'}
                type="submit"
                color="primary"
                rounded
                block
                loading={requestState.loading}
            />
        </form>
    )
}

export default CustomServiceForm
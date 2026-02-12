import { toast } from "sonner"
import dayjs from "dayjs"

import {
    ToggleGroup,
    ToggleGroupItem,
} from "@/components/ui/toggle-group"

import Button from "@/components/common/Button"
import TextInput from "@/components/common/Inputs/TextInput"
import useCustomForm from "@/hooks/useCustomForm"
import { CustomerFormData, CustomerSchema } from "./schema"
import { Gender } from "@/interfaces/common"
import { API_ROUTES } from "@/constants/api"
import { publishEvent } from "@/utils/events"
import { CustomerOfClient } from "@/interfaces/customerOfClients"
import useRequestQuery from "@/hooks/useRequestQuery"
import { BROWSER_EVENTS } from "@/constants/app"
import DatePicker from "@/components/common/Inputs/DatePicker"
import useCustomerActions from "../../hooks/useCustomerActions"

interface Props {
    item?: CustomerOfClient
    onSuccess?: () => void
}

const CustomerByClientForm = ({ item, onSuccess }: Props) => {
    const isEdit = Boolean(item)

    const {
        register,
        handleSubmit,
        setValue,
        watch,
        formState: { errors },
    } = useCustomForm<CustomerFormData>(
        CustomerSchema,
        item ? {
            ...item,
            dob: item.dob ? new Date(dayjs(item.dob).toDate()) : null
        } : { gender: Gender.FEMALE }
    )
    const { request, requestState } = useRequestQuery()
    const { updateCachedCustomer, addCachedCustomer } = useCustomerActions()

    const onSuccessForm = (newItem: CustomerOfClient) => {
        toast.success('Datos actualizados correctamente')
        publishEvent(BROWSER_EVENTS.CUSTOMER_CLIENTS_LIST_UPDATED, { data: newItem, action: isEdit ? 'updated' : 'created' })
        if (isEdit) {
            updateCachedCustomer(newItem.id, newItem)
        } else {
            addCachedCustomer(newItem)
        }
        onSuccess?.()
    }

    const onRequest = async (data: CustomerFormData | Partial<CustomerFormData>) => {
        return request<CustomerFormData | Partial<CustomerFormData>, CustomerOfClient>(
            item ? 'PUT' : 'POST',
            item ? API_ROUTES.MY_CLIENTS.UPDATE.replace('{id}', item.id) : API_ROUTES.MY_CLIENTS.CREATE,
            data
        )
    }

    const onFormSubmit = async (data: CustomerFormData | Partial<CustomerFormData>) => {
        try {
            const response = await onRequest(data)
            if (response.success) {
                onSuccessForm(response.data)
            }
        } catch (error) {
            console.error(error)
        }
    }

    return (
        <form onSubmit={handleSubmit(onFormSubmit)}>
            <div className="flex flex-col gap-5 mx-auto mb-16">
                <TextInput
                    label="Nombre Completo"
                    register={register('name')}
                    error={errors.name?.message}
                />

                <DatePicker
                    label="Fecha de Nacimiento"
                    dateValue={watch('dob') || undefined}
                    onDateChange={date => setValue('dob', date)}
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

export default CustomerByClientForm
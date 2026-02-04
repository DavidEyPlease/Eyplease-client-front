import Button from "@/components/common/Button"
import Modal from "@/components/common/Modal"
import { CustomerOfClient } from "@/interfaces/customerOfClients"
import { useState } from "react"
import CustomerByClientForm from "./Form"
import AlertConfirm from "@/components/generics/AlertConfirm"
import { Button as UIButton } from "@/components/ui/button"
import useRequestQuery from "@/hooks/useRequestQuery"
import { API_ROUTES } from "@/constants/api"
import { BROWSER_EVENTS } from "@/constants/app"
import { publishEvent } from "@/utils/events"

interface Props {
    item: CustomerOfClient
}

const CustomerEdit = ({ item }: Props) => {
    const [openEdit, setOpenEdit] = useState(false)

    const { request, requestState } = useRequestQuery()

    const onRemoveCustomer = async () => {
        try {
            const response = await request('DELETE', API_ROUTES.MY_CLIENTS.DELETE.replace('{id}', item.id))
            if (response.success) {
                publishEvent(BROWSER_EVENTS.CUSTOMER_CLIENTS_LIST_UPDATED, { data: { id: item.id }, action: 'deleted' })
            }
        } catch (error) {
            console.error(error)
        }
    }

    return (
        <div className="flex justify-center gap-x-2">
            <Button disabled={requestState.loading} text='Editar' rounded size='sm' onClick={() => setOpenEdit(true)} />
            <AlertConfirm
                trigger={
                    <UIButton
                        variant="ghost"
                        className="text-red-500 dark:text-white"
                        size="sm"
                        disabled={requestState.loading}
                    >
                        {requestState.loading ? 'Eliminando...' : 'Eliminar'}
                    </UIButton>
                }
                description='El cliente será eliminado permanentemente. ¿Deseas continuar?'
                loading={requestState.loading}
                onConfirm={onRemoveCustomer}
            />
            <Modal open={openEdit} onOpenChange={setOpenEdit} title="Editar Cliente">
                <CustomerByClientForm item={item} onSuccess={() => setOpenEdit(false)} />
            </Modal>
        </div>
    )
}

export default CustomerEdit
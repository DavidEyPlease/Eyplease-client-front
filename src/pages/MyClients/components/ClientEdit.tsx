import { useState } from "react"

import Button from "@/components/common/Button"
import Modal from "@/components/common/Modal"
import { CustomerOfClient } from "@/interfaces/customerOfClients"
import CustomerByClientForm from "./Form"
import AlertConfirm from "@/components/generics/AlertConfirm"
import { Button as UIButton } from "@/components/ui/button"
import useCustomerActions from "../hooks/useCustomerActions"

interface Props {
    item: CustomerOfClient
}

const CustomerEdit = ({ item }: Props) => {
    const [openEdit, setOpenEdit] = useState(false)

    const { requestState, onRemoveCustomer } = useCustomerActions()

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
                onConfirm={() => onRemoveCustomer(item.id)}
            />
            <Modal open={openEdit} onOpenChange={setOpenEdit} title="Editar Cliente">
                <CustomerByClientForm item={item} onSuccess={() => setOpenEdit(false)} />
            </Modal>
        </div>
    )
}

export default CustomerEdit
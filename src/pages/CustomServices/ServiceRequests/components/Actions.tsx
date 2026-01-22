import Modal from "@/components/common/Modal"
import AlertConfirm from "@/components/generics/AlertConfirm"
import { Button } from "@/components/ui/button"
import { UserRequestService } from "@/interfaces/requestService"
import { useRequestServicesStore } from "@/store/request-services"
import { EyeIcon, PencilIcon, TrashIcon } from "lucide-react"
import CustomServiceForm from "./Form"
import { useState } from "react"
import { API_ROUTES } from "@/constants/api"
import useRequestQuery from "@/hooks/useRequestQuery"
import { queryKeys } from "@/utils/cache"

interface Props {
    item: UserRequestService
}

const ServiceActions = ({ item }: Props) => {
    const [selectedId, setSelectedId] = useState('')
    const { openAction, setSelectedItem, setOpenAction } = useRequestServicesStore(state => state)

    const onOpenDetail = () => {
        setSelectedItem(item)
        setOpenAction('view')
    }

    const { request: deleteRequest, requestState } = useRequestQuery({
        invalidateQueries: [queryKeys.list("services")],
    })

    const handleDelete = async () => {
        try {
            await deleteRequest('DELETE', API_ROUTES.CUSTOM_SERVICES.DELETE.replace('{id}', item?.id))
        } catch (error) {
            console.error('Error deleting service:', error)
        }
    }

    return (
        <div className="flex">
            <Button variant="ghost" className="text-primary rounded-lg cursor-pointer" onClick={onOpenDetail}>
                Ver detalles
                <EyeIcon />
            </Button>
            <Button
                variant="ghost"
                size="icon"
                className="text-emerald-400 rounded-lg"
                onClick={() => {
                    setOpenAction('edit')
                    setSelectedId(item.id)
                }}
            >
                <PencilIcon />
            </Button>
            <AlertConfirm
                trigger={
                    <Button
                        variant="ghost"
                        size="icon"
                        className="text-red-400 rounded-lg"
                        disabled={requestState.loading}
                    >
                        <TrashIcon />
                    </Button>
                }
                description='El servicio personalizado será eliminado permanentemente. Esta acción no se puede deshacer.'
                loading={requestState.loading}
                onConfirm={handleDelete}
            />

            <Modal
                open={openAction === 'edit' && selectedId === item.id}
                onOpenChange={() => setOpenAction('none')}
                title={`Editar servicio: ${item.title}`}
                size="lg"
            >
                <CustomServiceForm
                    item={item}
                    onHandleSuccess={() => {
                        setOpenAction('none')
                        setSelectedId('')
                    }}
                />
            </Modal>
        </div>
    )
}

export default ServiceActions
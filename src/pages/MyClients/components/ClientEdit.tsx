import Button from "@/components/common/Button"
import Modal from "@/components/common/Modal"
import { CustomerOfClient } from "@/interfaces/customerOfClients"
import { useState } from "react"
import CustomerByClientForm from "./Form"

interface Props {
    item: CustomerOfClient
}

const CustomerEdit = ({ item }: Props) => {
    const [openEdit, setOpenEdit] = useState(false)

    return (
        <>
            <Button text='Editar' className="mx-auto" rounded size='sm' onClick={() => setOpenEdit(true)} />
            <Modal open={openEdit} onOpenChange={setOpenEdit} title="Editar Cliente">
                <CustomerByClientForm item={item} onSuccess={() => setOpenEdit(false)} />
            </Modal>
        </>
    )
}

export default CustomerEdit
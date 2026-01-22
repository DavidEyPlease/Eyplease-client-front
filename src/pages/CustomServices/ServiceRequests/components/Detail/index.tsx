import { useState } from "react"

import { UserRequestService } from "@/interfaces/requestService"

import Modal from "@/components/common/Modal"
import DateContainer from "@/components/generics/DateContainer"
import { Badge } from "@/components/ui/badge"
import ServiceStatusBadge from "../StatusBadge"
import DynamicTabs from "@/components/generics/DynamicTabs"
import BasicDetails from "./BasicDetails"
import ServiceActions from "./Actions"
import ServiceRequestHistory from "./History"
import CustomServiceFiles from "./Files"
import { Separator } from "@/components/ui/separator"

interface ModalDetailProps {
    item: UserRequestService
    open: boolean
    onOpenChange: (open: boolean) => void
}

export const SummaryDetails = ({ item }: { item: UserRequestService }) => {
    return (
        <>
            <div className="flex justify-between items-center">
                <div className="flex items-center gap-x-2">
                    <Badge variant="outline">{item.category}</Badge>
                    <DateContainer date={item.delivery_date} label="Entrega:" />
                </div>
                <ServiceStatusBadge status={item.status} />
            </div>

            <BasicDetails item={item} />

            <Separator />
        </>
    )
}

const ModalDetail = ({ item, open, onOpenChange }: ModalDetailProps) => {
    const [activeContent, setActiveContent] = useState('files')

    return (
        <Modal
            open={open}
            onOpenChange={onOpenChange}
            title={item.title}
            size="2xl"
        >
            <SummaryDetails item={item} />

            <DynamicTabs
                items={[
                    { value: 'files', label: "Archivos" },
                    { value: 'history', label: "Historial" },
                    { value: 'actions', label: "Corrección" }
                ]}
                value={activeContent}
                onValueChange={value => setActiveContent(value)}
            />

            {activeContent === 'files' && (<CustomServiceFiles itemId={item.id} />)}
            {activeContent === 'history' && <ServiceRequestHistory itemId={item.id} />}
            {activeContent === 'actions' && <ServiceActions itemId={item.id} />}
        </Modal>
    )
}

export default ModalDetail

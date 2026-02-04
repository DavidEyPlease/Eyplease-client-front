import { useState } from "react"


import Modal from "@/components/common/Modal"
import DateContainer from "@/components/generics/DateContainer"
import { Badge } from "@/components/ui/badge"
import DynamicTabs from "@/components/generics/DynamicTabs"
// import ServiceActions from "./Actions"
import { Separator } from "@/components/ui/separator"
import { EventType, IEvent } from "@/interfaces/events"
import ServiceActions from "@/pages/CustomServices/ServiceRequests/components/Detail/Actions"
import CustomServiceFiles from "@/pages/CustomServices/ServiceRequests/components/Detail/Files"
import ServiceStatusBadge from "@/pages/CustomServices/ServiceRequests/components/StatusBadge"
import BasicDetails from "@/pages/CustomServices/ServiceRequests/components/Detail/BasicDetails"
import { EVENT_TYPES_LABEL } from "@/constants/app"
import { ONLINE_DATA_LABELS_MAP } from "../../utils"
import { Button } from "@/components/ui/button"
import { CopyIcon } from "lucide-react"

interface ModalDetailProps {
    item: IEvent
    open: boolean
    onOpenChange: (open: boolean) => void
}

export const SummaryDetails = ({ item }: { item: IEvent }) => {
    return (
        <div>
            <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-x-2">
                    <Badge variant="outline">{EVENT_TYPES_LABEL[item.event_type]}</Badge>
                    {item.service?.delivery_date && <DateContainer date={item.service.delivery_date} label="Entrega:" />}
                </div>
                {item.service && <ServiceStatusBadge status={item.service.status} />}
            </div>

            {item.service && <BasicDetails item={item.service} />}
        </div>
    )
}

const EventInfo = ({ item }: { item: IEvent }) => {
    return (
        <div className="grid md:grid-cols-2">
            {item.event_type === EventType.ONLINE && item.online_data && (
                <div>
                    <h3 className="text-sm font-semibold text-dark mb-3">Links del evento</h3>
                    {(item.online_data.platforms || []).map((platform, index) => {
                        const labelData = ONLINE_DATA_LABELS_MAP[platform]
                        return (
                            <div className="mb-3" key={`${platform}-${index}`}>
                                <div className="flex items-center gap-2">
                                    <div className="[&>svg]:size-4.5 [&>svg]:text-primary">
                                        <labelData.icon />
                                    </div>
                                    <p className="text-sm font-medium">{labelData.title}</p>
                                </div>
                                {item?.online_data && (
                                    <div className="flex items-center gap-5">
                                        <p className="text-sm text-tertiary">{item?.online_data[labelData.value]}</p>
                                        <Button variant='ghost' className="text-primary" size='icon' onClick={() => console.log(item?.online_data?.[labelData.value]?.toString() || '')}>
                                            <CopyIcon />
                                        </Button>
                                    </div>
                                )}
                            </div>
                        )
                    })}
                </div>
            )}
            <div>
                <h3 className="text-sm font-semibold text-dark mb-3">Fechas del evento</h3>
                {item.dates.map((date, index) => (
                    <div className="mb-2" key={`${index}_${date.id}`}>
                        <DateContainer date={date.start_date} label={`Fecha ${index + 1}: `} />
                    </div>
                ))}
            </div>
        </div>
    )
}

const EventDetail = ({ item, open, onOpenChange }: ModalDetailProps) => {
    const [activeContent, setActiveContent] = useState('files')

    return (
        <Modal
            open={open}
            onOpenChange={onOpenChange}
            title={item.title}
            size="2xl"
        >
            <div className="grid md:grid-cols-2 gap-4">
                <SummaryDetails item={item} />
                <EventInfo item={item} />
            </div>

            <Separator />

            <DynamicTabs
                items={[
                    { value: 'files', label: "Archivos" },
                    { value: 'actions', label: "Corrección" }
                ]}
                value={activeContent}
                onValueChange={value => setActiveContent(value)}
            />

            {activeContent === 'files' && item.service && (
                <CustomServiceFiles
                    itemId={item.service.id}
                />
            )}
            {activeContent === 'actions' && item.service && <ServiceActions itemId={item.service.id} />}
        </Modal>
    )
}

export default EventDetail

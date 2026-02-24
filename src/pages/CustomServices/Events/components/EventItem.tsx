import { Card, CardContent } from "@/components/ui/card"
import { EVENT_TYPES_LABEL, MAP_USER_REQUEST_STATUS } from "@/constants/app"
import { IEvent } from "@/interfaces/events"
import { UserRequestStatusTypes } from "@/interfaces/requestService"
import ServiceStatusBadge from "../../ServiceRequests/components/StatusBadge"
import DateContainer from "@/components/generics/DateContainer"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { EllipsisVerticalIcon } from "lucide-react"
import AlertConfirm from "@/components/generics/AlertConfirm"
import Spinner from "@/components/common/Spinner"
import useRequestQuery from "@/hooks/useRequestQuery"
import { API_ROUTES } from "@/constants/api"
import { useState } from "react"
import EventDetail from "./Detail"
import Modal from "@/components/common/Modal"
import EventForm from "./Form"
import { useRequestServicesStore } from "@/store/request-services"

interface EventItemProps {
    event: IEvent
    onSuccess: (event: IEvent, action: 'update' | 'delete') => void
}

const EventItem = ({ event, onSuccess }: EventItemProps) => {
    const { setSelectedItem } = useRequestServicesStore(state => state)
    const [openAction, setOpenAction] = useState<'detail' | 'edit'>()
    const STATUS_STYLE_PROPERTIES = MAP_USER_REQUEST_STATUS[event.service?.status || UserRequestStatusTypes.UNASSIGNED]

    const { request, requestState } = useRequestQuery()

    const onOpenDetail = () => {
        setOpenAction('detail')
        setSelectedItem(event.service || null)
    }

    const onRemoveEvent = async () => {
        try {
            const response = await request('DELETE', API_ROUTES.DELETE_EVENT.replace('{id}', event.id))
            if (response.success) {
                onSuccess(event, 'delete')
            }
        } catch (error) {
            console.error(error)
        }
    }

    return (
        <>
            <Card className='py-3' key={event.id}>
                <CardContent className='px-2'>
                    <div className="flex items-center justify-between mb-1">
                        {event.service && (<ServiceStatusBadge status={event.service.status} />)}
                        <div className="flex">
                            {event.service?.delivery_date &&
                                <DateContainer date={event.service.delivery_date} label="Entrega" format={{ date: 'medium' }} />
                            }
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button
                                        variant="ghost"
                                        className="data-[state=open]:bg-muted text-muted-foreground flex size-8"
                                        size="icon"
                                    >
                                        <EllipsisVerticalIcon />
                                        <span className="sr-only">Open menu</span>
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-32">
                                    <DropdownMenuItem onClick={() => setOpenAction('edit')}>
                                        Editar
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                    <AlertConfirm
                                        trigger={
                                            <DropdownMenuItem
                                                disabled={requestState.loading || event.service?.status !== UserRequestStatusTypes.UNASSIGNED}
                                                variant="destructive"
                                                onSelect={(e) => e.preventDefault()}
                                            >
                                                <div className="flex items-center justify-between w-full">
                                                    Eliminar
                                                    {requestState.loading && (
                                                        <div className="ml-2">
                                                            <Spinner />
                                                        </div>
                                                    )}
                                                </div>
                                            </DropdownMenuItem>
                                        }
                                        description='El evento será eliminado permanentemente'
                                        loading={requestState.loading}
                                        onConfirm={() => onRemoveEvent()}
                                    />
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className={cn('w-1 h-16 rounded-sm', STATUS_STYLE_PROPERTIES.bgBorder)}></div>
                        <div>
                            <button
                                className="text-sm font-bold text-dark underline cursor-pointer"
                                onClick={() => onOpenDetail()}
                            >
                                {event.title}
                            </button>
                            <p className="text-xs text-tertiary">
                                {event.description && event.description.substring(0, 100)}...
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center justify-between mt-2">
                        <Badge variant='outline'>
                            {EVENT_TYPES_LABEL[event.event_type]}
                        </Badge>
                        <DateContainer date={event.start_date} label="Fecha:" />
                    </div>
                </CardContent>
            </Card>
            <Modal
                open={openAction === 'edit'}
                onOpenChange={() => setOpenAction(undefined)}
                title={`Editar evento: ${event.title}`}
                size="xl"
            >
                {openAction === 'edit' && (
                    <EventForm
                        item={event}
                        onHandleSuccess={(event) => {
                            onSuccess(event, 'update')
                            setOpenAction(undefined)
                        }}
                    />
                )}
            </Modal>
            <EventDetail
                item={event}
                open={openAction === 'detail'}
                onOpenChange={() => {
                    setOpenAction(undefined)
                    setSelectedItem(null)
                }}
            />
        </>

    )
}

export default EventItem
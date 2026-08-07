import { useState } from "react"
import { CalendarIcon, EllipsisVerticalIcon } from "lucide-react"

import Modal from "@/components/common/Modal"
import Spinner from "@/components/common/Spinner"
import AlertConfirm from "@/components/generics/AlertConfirm"
import MetaPill from "@/components/generics/MetaPill"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { API_ROUTES } from "@/constants/api"
import { EVENT_TYPES_LABEL } from "@/constants/app"
import useRequestQuery from "@/hooks/useRequestQuery"
import { IEvent } from "@/interfaces/events"
import { UserRequestStatusTypes } from "@/interfaces/requestService"
import { formatDate } from "@/utils/dates"
import ServiceStatusBadge from "../../ServiceRequests/components/StatusBadge"
import EventForm from "./Form"

interface EventItemProps {
    event: IEvent
    onSuccess: (event: IEvent, action: 'update' | 'delete') => void
    onOpenDetail: (event: IEvent) => void
}

/** Tarjeta de agenda: bloque de fecha, título, estado del servicio ligado y acciones. */
const EventItem = ({ event, onSuccess, onOpenDetail }: EventItemProps) => {
    const [openEdit, setOpenEdit] = useState(false)

    const { request, requestState } = useRequestQuery()

    /* Misma regla de siempre: solo se elimina si el servicio ligado sigue pendiente */
    const deleteDisabled = requestState.loading ||
        (!!event.service?.status && event.service.status !== UserRequestStatusTypes.UNASSIGNED)

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
            <article className="flex items-start gap-2 rounded-2xl border bg-card p-3 shadow-card transition-all hover:-translate-y-0.5 hover:border-primary/20 hover:shadow-card-hover">
                <button
                    type="button"
                    onClick={() => onOpenDetail(event)}
                    className="flex min-w-0 flex-1 cursor-pointer items-start gap-3 text-left"
                >
                    <span className="w-11 shrink-0 overflow-hidden rounded-xl border bg-surface-soft text-center">
                        <span className="block pt-1 pb-0.5 text-[17px] leading-none font-extrabold tracking-tight">
                            {formatDate(event.start_date, { formatter: 'D', dateOnly: true })}
                        </span>
                        <span className="block bg-primary-gradient py-0.5 text-[9px] font-extrabold tracking-widest text-white uppercase">
                            {formatDate(event.start_date, { formatter: 'MMM', dateOnly: true })}
                        </span>
                    </span>

                    <span className="flex min-w-0 flex-1 flex-col gap-1.5">
                        <span className="line-clamp-1 text-[13px] leading-snug font-bold tracking-tight">{event.title}</span>
                        <span className="flex flex-wrap items-center gap-1.5">
                            {event.service && <ServiceStatusBadge status={event.service.status} />}
                            <MetaPill>{EVENT_TYPES_LABEL[event.event_type]}</MetaPill>
                        </span>
                        {event.description && (
                            <span className="line-clamp-1 text-[11.5px] font-medium text-muted-foreground">{event.description}</span>
                        )}
                        {event.service?.delivery_date && (
                            <span className="flex items-center gap-1.5 text-[11px] font-semibold text-muted-foreground">
                                <CalendarIcon className="size-3 shrink-0" aria-hidden />
                                Entrega: {formatDate(event.service.delivery_date, { formatter: { date: 'medium' } })}
                            </span>
                        )}
                    </span>
                </button>

                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button
                            variant="ghost"
                            size="icon-sm"
                            className="shrink-0 cursor-pointer text-muted-foreground data-[state=open]:bg-muted"
                        >
                            <EllipsisVerticalIcon />
                            <span className="sr-only">Abrir menú</span>
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-32">
                        <DropdownMenuItem onClick={() => setOpenEdit(true)}>
                            Editar
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <AlertConfirm
                            trigger={
                                <DropdownMenuItem
                                    disabled={deleteDisabled}
                                    variant="destructive"
                                    onSelect={(e) => e.preventDefault()}
                                >
                                    <div className="flex w-full items-center justify-between">
                                        Eliminar
                                        {requestState.loading && (
                                            <div className="ml-2">
                                                <Spinner />
                                            </div>
                                        )}
                                    </div>
                                </DropdownMenuItem>
                            }
                            description="El evento será eliminado permanentemente"
                            loading={requestState.loading}
                            onConfirm={() => onRemoveEvent()}
                        />
                    </DropdownMenuContent>
                </DropdownMenu>
            </article>

            <Modal
                open={openEdit}
                onOpenChange={() => setOpenEdit(false)}
                title={`Editar evento: ${event.title}`}
                size="xl"
            >
                {openEdit && (
                    <EventForm
                        item={event}
                        onHandleSuccess={(updatedEvent) => {
                            onSuccess(updatedEvent, 'update')
                            setOpenEdit(false)
                        }}
                    />
                )}
            </Modal>
        </>
    )
}

export default EventItem

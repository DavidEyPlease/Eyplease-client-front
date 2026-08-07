import { EventClickArg, EventContentArg } from '@fullcalendar/core'
import FullCalendar from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/daygrid'
import esLocale from '@fullcalendar/core/locales/es'
import { useRef, useState } from 'react'
import { CalendarOffIcon, PlusIcon } from 'lucide-react'

import Button from '@/components/common/Button'
import Modal from '@/components/common/Modal'
import Spinner from '@/components/common/Spinner'
import { API_ROUTES } from '@/constants/api'
import useListQuery from '@/hooks/useListQuery'
import { CursorPaginationResponse } from '@/interfaces/common'
import { IEvent } from '@/interfaces/events'
import { UserRequestService } from '@/interfaces/requestService'
import { cn } from '@/lib/utils'
import { useRequestServicesStore } from '@/store/request-services'
import { queryKeys } from '@/utils/cache'
import EventDetail from './components/Detail'
import EventForm from './components/Form'
import EventItem from './components/EventItem'
import { CALENDAR_EVENT_CLASSES, CALENDAR_EVENT_STATUS_CLASSES } from './utils'

const transformCalendarEvents = (events: IEvent[]) => {
    return events.map((event) => ({
        ...event,
        start: new Date(event.start_date).toISOString().replace(/T.*$/, ''),
    }))
}

/* La píldora del calendario la pinta React: toma el gradiente del estado del servicio ligado */
const renderEventContent = (eventInfo: EventContentArg) => {
    const service = eventInfo.event.extendedProps.service as UserRequestService | null

    return (
        <div
            className={cn(
                CALENDAR_EVENT_CLASSES,
                service ? CALENDAR_EVENT_STATUS_CLASSES[service.status] : 'bg-primary-gradient',
            )}
        >
            {eventInfo.event.title}
        </div>
    )
}

const CURRENT_MONTH = new Date().getMonth() + 1

const Events = () => {
    const calendarRef = useRef<FullCalendar | null>(null)
    const [openCreate, setOpenCreate] = useState(false)
    const [openDetail, setOpenDetail] = useState(false)
    /* El id se retiene al cerrar: el drawer conserva su contenido durante la animación de salida */
    const [detailEventId, setDetailEventId] = useState<string | null>(null)
    const { setSelectedItem } = useRequestServicesStore(state => state)

    const {
        response: events,
        isLoading,
        setData,
        setFilter
    } = useListQuery<CursorPaginationResponse<IEvent>, { month: number }>({
        endpoint: API_ROUTES.GET_EVENTS,
        defaultFilters: { month: CURRENT_MONTH },
        customQueryKey: (params) => queryKeys.list(`events/month/${CURRENT_MONTH}`, params)
    })

    const items = events?.data?.items || []
    const detailEvent = items.find(event => event.id === detailEventId) ?? null

    const onEventActionSuccess = (event: IEvent, action: 'add' | 'update' | 'delete') => {
        if (action === 'delete' && events) {
            setData({
                ...events.data,
                items: items.filter(e => e.id !== event.id)
            })
        }
        if (action === 'add' && events) {
            setData({
                ...events.data,
                items: [...items, event]
            })
        }
        if (action === 'update' && events) {
            setData({
                ...events.data,
                items: items.map(e => e.id === event.id ? event : e)
            })
        }
    }

    /* El workspace del drawer opera sobre el servicio ligado: useServiceFiles depende de selectedItem */
    const onOpenDetail = (event: IEvent) => {
        setSelectedItem(event.service || null)
        setDetailEventId(event.id)
        setOpenDetail(true)
    }

    const onCloseDetail = () => {
        setOpenDetail(false)
        setSelectedItem(null)
    }

    const onCalendarEventClick = (info: EventClickArg) => {
        const event = items.find(e => e.id === info.event.id)
        if (event) onOpenDetail(event)
    }

    return (
        <div className="grid items-start gap-4 lg:grid-cols-[minmax(0,1fr)_380px]">
            <div className="overflow-hidden rounded-3xl border bg-card shadow-card">
                <FullCalendar
                    ref={calendarRef}
                    plugins={[dayGridPlugin]}
                    headerToolbar={{
                        left: 'prev,next',
                        center: 'title',
                        right: 'dayGridMonth'
                    }}
                    locale={esLocale}
                    initialView='dayGridMonth'
                    editable={true}
                    selectable={true}
                    selectMirror={true}
                    dayMaxEvents={true}
                    events={transformCalendarEvents(items)}
                    eventContent={renderEventContent}
                    eventDurationEditable={false}
                    eventClick={onCalendarEventClick}
                    datesSet={(event) => setFilter({ month: new Date(event.view.currentStart).getMonth() + 1 })}
                />
            </div>

            <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between gap-3">
                    <h2 className="text-lg font-extrabold tracking-tight">Agenda</h2>
                    <Button
                        text={<><PlusIcon className="size-4" />Nuevo evento</>}
                        size="sm"
                        rounded
                        onClick={() => setOpenCreate(true)}
                    />
                </div>

                {isLoading && (
                    <div className="grid place-content-center py-10">
                        <Spinner size="lg" />
                    </div>
                )}

                {!isLoading && items.length === 0 && (
                    <div className="flex flex-col items-center gap-2 rounded-2xl border border-dashed px-6 py-10 text-center">
                        <CalendarOffIcon className="size-6 text-muted-foreground/50" aria-hidden />
                        <p className="text-sm font-semibold text-muted-foreground">No tienes eventos este mes.</p>
                    </div>
                )}

                {items.map(event => (
                    <EventItem
                        event={event}
                        key={event.id}
                        onSuccess={onEventActionSuccess}
                        onOpenDetail={onOpenDetail}
                    />
                ))}
            </div>

            <Modal
                open={openCreate}
                onOpenChange={() => setOpenCreate(false)}
                title="Nuevo evento"
                size="xl"
            >
                <EventForm
                    onHandleSuccess={(event) => {
                        setOpenCreate(false)
                        onEventActionSuccess(event, 'add')
                    }}
                />
            </Modal>

            {/* Montado siempre (patrón /posts): vaul transiciona de cerrado a abierto con animación fiable */}
            <EventDetail
                item={detailEvent}
                open={openDetail}
                onOpenChange={(open) => !open && onCloseDetail()}
            />
        </div>
    )
}

export default Events

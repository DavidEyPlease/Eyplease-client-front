import { EventContentArg } from '@fullcalendar/core'
import FullCalendar from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/daygrid'
import esLocale from '@fullcalendar/core/locales/es'
import { useEffect, useRef } from 'react'
import { cn } from '@/lib/utils'
import { API_ROUTES } from '@/constants/api'
import { queryKeys } from '@/utils/cache'
import { IEvent } from '@/interfaces/events'
import { CursorPaginationResponse } from '@/interfaces/common'
import useListQuery from '@/hooks/useListQuery'
import { Card, CardContent } from '@/components/ui/card'
import ServiceStatusBadge from '../ServiceRequests/components/StatusBadge'
import { EVENT_TYPES_LABEL, MAP_USER_REQUEST_STATUS } from '@/constants/app'
import { UserRequestStatusTypes } from '@/interfaces/requestService'
import DateContainer from '@/components/generics/DateContainer'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import Spinner from '@/components/common/Spinner'
// import interactionPlugin from '@fullcalendar/interaction'

const renderEventContent = (eventInfo: EventContentArg & { event: IEvent }) => {
    if (!eventInfo?.event) return null
    return (
        <div
            className={cn('p-2 rounded-md flex flex-col gap-y-2 shadow-sm', ...eventInfo.event.classNames)}
        >
            <div className="flex items-center gap-x-1 break-words">
                <p className={cn('break-words')}>{eventInfo.event.title.length > 15 ? `${eventInfo.event.title.substring(0, 15)}...` : eventInfo.event.title}</p>
            </div>
        </div>
    )
}

const CURRENT_MONTH = new Date().getMonth() + 1

const Events = () => {
    const calendarRef = useRef<FullCalendar | null>(null)

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

    useEffect(() => {
        if (events?.data) {
            setData({
                ...events.data,
                items: (events?.data?.items || []).map((event) => ({
                    ...event,
                    start: new Date(event.start_date).toISOString().replace(/T.*$/, ''),
                    // end: new Date(event.expired_at).toISOString().replace(/T.*$/, ''),
                    classNames: ['border-0', 'bg-primary', 'shadow-md'],
                }))
            })
        }
    }, [events?.data])

    return (
        <div className="grid md:grid-cols-6 gap-4">
            <Card className='col-span-4'>
                <CardContent className='p-0'>
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
                        events={events?.data?.items || []}
                        eventContent={renderEventContent}
                        eventDurationEditable={false}
                        // dateClick={handleDateSelect}
                        // eventClick={handleEventClick}
                        datesSet={(event) => setFilter({ month: new Date(event.view.currentStart).getMonth() + 1 })}
                    />
                </CardContent>
            </Card>
            <ScrollArea className="h-2/3 w-full col-span-2 rounded-md border py-4">
                <CardContent className='space-y-4 px-3'>
                    {isLoading && (<Spinner size='lg' />)}
                    {(events?.data?.items || []).map(event => {
                        const STATUS_STYLE_PROPERTIES = MAP_USER_REQUEST_STATUS[event.service?.status || UserRequestStatusTypes.UNASSIGNED]

                        return (
                            <Card className='py-3' key={event.id}>
                                <CardContent className='px-2'>
                                    <div className="flex items-center justify-between mb-1">
                                        {event.service && (<ServiceStatusBadge status={event.service.status} />)}
                                        {event.service?.delivery_date &&
                                            <DateContainer date={event.service.delivery_date} label="Entrega" />
                                        }
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className={cn('w-1 h-16 rounded-sm', STATUS_STYLE_PROPERTIES.bgBorder)}></div>
                                        <div>
                                            <h3 className="text-sm font-bold text-dark">{event.title}</h3>
                                            <p className="text-xs text-tertiary">
                                                {event.description && event.description.substring(0, 100)}...
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between mt-2">
                                        <Badge variant='outline'>
                                            {EVENT_TYPES_LABEL[event.event_type]}
                                        </Badge>
                                        <DateContainer date={event.start_date} label="Fecha del evento" />
                                    </div>
                                </CardContent>
                            </Card>
                        )
                    })}
                </CardContent>
            </ScrollArea>
        </div>
    )
}

export default Events
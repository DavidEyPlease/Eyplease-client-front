import { EventContentArg } from '@fullcalendar/core'
import FullCalendar from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/daygrid'
import esLocale from '@fullcalendar/core/locales/es'
import { useRef, useState } from 'react'
import { cn } from '@/lib/utils'
import { API_ROUTES } from '@/constants/api'
import { queryKeys } from '@/utils/cache'
import { IEvent } from '@/interfaces/events'
import { CursorPaginationResponse } from '@/interfaces/common'
import useListQuery from '@/hooks/useListQuery'
import { Card, CardContent } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import Spinner from '@/components/common/Spinner'
import EventItem from './components/EventItem'
import Button from '@/components/common/Button'
import Modal from '@/components/common/Modal'
import EventForm from './components/Form'
// import interactionPlugin from '@fullcalendar/interaction'

const transformCalendarEvents = (events: IEvent[]) => {
    return events.map((event) => ({
        ...event,
        start: new Date(event.start_date).toISOString().replace(/T.*$/, ''),
        // end: new Date(event.expired_at).toISOString().replace(/T.*$/, ''),
        classNames: ['border-0', 'bg-primary', 'shadow-md'],
    }))
}

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
    const [openCreate, setOpenCreate] = useState(false)

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

    const onEventActionSuccess = (event: IEvent, action: 'add' | 'update' | 'delete') => {
        if (action === 'delete' && events) {
            setData({
                ...events.data,
                items: (events.data.items || []).filter(e => e.id !== event.id)
            })
        }
        if (action === 'add' && events) {
            setData({
                ...events.data,
                items: [...events.data.items, event]
            })
        }
        if (action === 'update' && events) {
            setData({
                ...events.data,
                items: (events.data.items || []).map(e => e.id === event.id ? event : e)
            })
        }
    }

    // useEffect(() => {
    //     if (events?.data) {
    //         setData({
    //             ...events.data,
    //             items: (events?.data?.items || []).map((event) => ({
    //                 ...event,
    //                 start: new Date(event.start_date).toISOString().replace(/T.*$/, ''),
    //                 // end: new Date(event.expired_at).toISOString().replace(/T.*$/, ''),
    //                 classNames: ['border-0', 'bg-primary', 'shadow-md'],
    //             }))
    //         })
    //     }
    // }, [events?.data])

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
                        events={transformCalendarEvents(events?.data?.items || [])}
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
                    <Button
                        className='ml-auto'
                        text="Nuevo evento"
                        onClick={() => setOpenCreate(true)}
                    />
                    {isLoading && (<Spinner size='lg' />)}
                    {(events?.data?.items || []).map(event => (
                        <EventItem
                            event={event}
                            key={event.id}
                            onSuccess={onEventActionSuccess}
                        />
                    ))}
                </CardContent>
            </ScrollArea>

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
        </div>
    )
}

export default Events
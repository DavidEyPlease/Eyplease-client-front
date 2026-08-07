import { CalendarIcon, CopyIcon, MapPinIcon } from 'lucide-react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { EventType, IEvent } from '@/interfaces/events'
import { singleFormatDate } from '@/utils/dates'
import { ONLINE_DATA_LABELS_MAP } from '../utils'

interface FactProps {
    icon: React.ReactNode
    value: string
    label: string
    copyable?: boolean
}

const onCopy = async (value: string) => {
    try {
        await navigator.clipboard.writeText(value)
        toast.success('Copiado al portapapeles')
    } catch {
        toast.error('No se pudo copiar')
    }
}

const Fact = ({ icon, value, label, copyable }: FactProps) => (
    <div className="flex items-center gap-2.5 rounded-xl border bg-card px-3 py-2.5">
        <span className="grid size-8 shrink-0 place-content-center rounded-lg bg-primary/[0.08] text-primary [&>svg]:size-4">
            {icon}
        </span>
        <span className="min-w-0 flex-1">
            <span className="block truncate text-[12.5px] font-bold tracking-tight">{value}</span>
            <span className="block text-[10.5px] font-semibold text-muted-foreground">{label}</span>
        </span>
        {copyable && (
            <Button
                variant="ghost"
                size="icon-sm"
                title="Copiar"
                className="shrink-0 cursor-pointer text-muted-foreground/60 hover:text-primary"
                onClick={() => onCopy(value)}
            >
                <CopyIcon />
            </Button>
        )}
    </div>
)

interface Props {
    event: IEvent
}

/** Datos del evento: fechas (con ubicación) y enlaces de las plataformas online. */
const EventFacts = ({ event }: Props) => {
    const showPlatforms = event.event_type === EventType.ONLINE && event.online_data

    return (
        <div className="grid gap-2 sm:grid-cols-2">
            {event.dates.map((date, index) => (
                <Fact
                    key={date.id}
                    icon={<CalendarIcon aria-hidden />}
                    value={singleFormatDate(date.start_date)}
                    label={event.dates.length > 1 ? `Fecha ${index + 1}` : 'Fecha del evento'}
                />
            ))}

            {event.dates.filter(date => date.location).map(date => (
                <Fact
                    key={`${date.id}-location`}
                    icon={<MapPinIcon aria-hidden />}
                    value={date.location}
                    label="Ubicación"
                />
            ))}

            {showPlatforms && (event.online_data?.platforms || []).map((platform, index) => {
                const labelData = ONLINE_DATA_LABELS_MAP[platform]
                const value = event.online_data?.[labelData.value]?.toString()
                if (!value) return null

                return (
                    <Fact
                        key={`${platform}-${index}`}
                        icon={<labelData.icon />}
                        value={value}
                        label={labelData.title}
                        copyable
                    />
                )
            })}
        </div>
    )
}

export default EventFacts

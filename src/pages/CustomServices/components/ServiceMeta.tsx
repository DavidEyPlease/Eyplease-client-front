import { CalendarIcon, LayersIcon, PaletteIcon } from 'lucide-react'

import MetaPill from '@/components/generics/MetaPill'
import { UserRequestService } from '@/interfaces/requestService'
import { formatDate } from '@/utils/dates'

interface Props {
    item: UserRequestService
}

const ColorSwatch = ({ value }: { value: string }) => (
    // Estilo inline necesario: el color lo elige el cliente al crear la solicitud
    <span aria-hidden title={value} className="size-3 rounded ring-1 ring-black/10" style={{ backgroundColor: value }} />
)

/** Metadatos de la solicitud: categoría, entrega, colores de marca y descripción. */
const ServiceMeta = ({ item }: Props) => {
    const { primaryColor, secondaryColor } = item.metadata ?? {}
    const hasColors = !!primaryColor || !!secondaryColor

    return (
        <div className="flex flex-col gap-2.5">
            <div className="flex flex-wrap items-center gap-1.5">
                <MetaPill icon={<LayersIcon aria-hidden />}>{item.category}</MetaPill>
                <MetaPill icon={<CalendarIcon aria-hidden />}>
                    Entrega: {formatDate(item.delivery_date, { formatter: { date: 'medium' } })}
                </MetaPill>
                {hasColors && (
                    <MetaPill icon={<PaletteIcon aria-hidden />}>
                        {primaryColor && <ColorSwatch value={primaryColor} />}
                        {secondaryColor && <ColorSwatch value={secondaryColor} />}
                    </MetaPill>
                )}
            </div>
            {item.description && (
                <p className="text-[12.5px] leading-relaxed font-medium text-muted-foreground">{item.description}</p>
            )}
        </div>
    )
}

export default ServiceMeta

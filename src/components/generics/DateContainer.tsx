import { formatDate, singleFormatDate } from "@/utils/dates"
import { Format } from "@formkit/tempo"

import { CalendarIcon } from "lucide-react"

interface DateContainerProps {
    date: Date | null
    label?: string
    format?: Format
    omitTz?: boolean
}

const DateContainer = ({ date, label, format, omitTz }: DateContainerProps) => {
    const formatText = date ? (omitTz ? singleFormatDate(date) : formatDate(date, { formatter: format })) : '-'
    return (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <CalendarIcon className="h-4 w-4" aria-hidden />
            <span>{label || "Fecha:"} {formatText}</span>
        </div>
    )
}

export default DateContainer
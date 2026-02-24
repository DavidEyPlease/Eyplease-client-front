import { formatDate } from "@/utils/dates"
import { Format } from "@formkit/tempo"
import { CalendarIcon } from "lucide-react"

interface DateContainerProps {
    date: Date | null
    label?: string
    format?: Format
}

const DateContainer = ({ date, label, format }: DateContainerProps) => {
    return (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <CalendarIcon className="h-4 w-4" aria-hidden />
            <span>{label || "Fecha:"} {date ? formatDate(date, { formatter: format }) : '-'}</span>
        </div>
    )
}

export default DateContainer
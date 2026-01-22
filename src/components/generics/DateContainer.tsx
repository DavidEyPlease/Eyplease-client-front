import { formatDate } from "@/utils/dates"
import { CalendarIcon } from "lucide-react"

interface DateContainerProps {
    date: Date | null
    label?: string
}

const DateContainer = ({ date, label }: DateContainerProps) => {
    return (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <CalendarIcon className="h-4 w-4" aria-hidden />
            <span>{label || "Fecha:"} {date ? formatDate(date) : '-'}</span>
        </div>
    )
}

export default DateContainer
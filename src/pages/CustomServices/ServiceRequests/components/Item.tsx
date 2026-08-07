import { CalendarIcon, ChevronRightIcon, ImageIcon } from "lucide-react"

import useAuth from "@/hooks/useAuth"
import { UserRequestService } from "@/interfaces/requestService"
import { cn } from "@/lib/utils"
import { formatDate } from "@/utils/dates"
import { getServiceCover } from "../../utils"
import ServiceStatusBadge from "./StatusBadge"

interface Props {
    item: UserRequestService
    active: boolean
    onSelect: () => void
}

/** Fila de la bandeja: miniatura del último diseño, título, meta y estado. */
const CustomServiceItem = ({ item, active, onSelect }: Props) => {
    const { user } = useAuth()
    const cover = getServiceCover(item, user?.user_id)

    return (
        <li className={cn(
            "relative border-b border-border/60 transition-colors last:border-b-0",
            active ? "bg-primary/[0.05] before:absolute before:inset-y-0 before:left-0 before:w-[3px] before:bg-primary-gradient" : "hover:bg-surface-soft",
        )}>
            <button type="button" onClick={onSelect} className="flex w-full cursor-pointer items-center gap-3 px-4 py-3 text-left">
                <span className="grid aspect-4/5 w-11 shrink-0 place-content-center overflow-hidden rounded-lg border bg-surface-soft text-muted-foreground/50">
                    {cover
                        ? <img src={cover} alt="" loading="lazy" className="size-full object-cover" />
                        : <ImageIcon className="size-4" aria-hidden />}
                </span>

                <span className="flex min-w-0 flex-1 flex-col gap-1">
                    <span className="truncate text-[13.5px] font-bold tracking-tight">{item.title}</span>
                    <span className="flex items-center gap-1.5 text-[11px] font-semibold text-muted-foreground">
                        {item.category}
                        <span aria-hidden>·</span>
                        <CalendarIcon className="size-3 shrink-0" aria-hidden />
                        {formatDate(item.delivery_date, { formatter: { date: 'medium' } })}
                    </span>
                </span>

                <ServiceStatusBadge status={item.status} />
                <ChevronRightIcon className={cn("size-4 shrink-0 text-border", active && "text-primary")} aria-hidden />
            </button>
        </li>
    )
}

export default CustomServiceItem

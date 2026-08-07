import { MAP_USER_REQUEST_STATUS } from "@/constants/app"
import { UserRequestStatusTypes } from "@/interfaces/requestService"
import { cn } from "@/lib/utils"

interface Props {
    status: UserRequestStatusTypes
}

const ServiceStatusBadge = ({ status }: Props) => {
    const { label, classes } = MAP_USER_REQUEST_STATUS[status]

    return (
        <span className={cn("inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-bold whitespace-nowrap", classes)}>
            <span aria-hidden className="size-1.5 rounded-full bg-current" />
            {label}
        </span>
    )
}

export default ServiceStatusBadge

import { MAP_USER_REQUEST_STATUS } from "@/constants/app"
import { UserRequestStatusTypes } from "@/interfaces/requestService"
import { cn } from "@/lib/utils"

interface Props {
    status: UserRequestStatusTypes
}

const ServiceStatusBadge = ({ status }: Props) => {
    // const styles = {
    //     [UserRequestStatusTypes.ASSIGNED]: "bg-blue-100 text-blue-800 border border-blue-200",
    //     [UserRequestStatusTypes.UNASSIGNED]: "bg-warning-100 text-warning-800 border border-warning-200",
    //     [UserRequestStatusTypes.IN_PROGRESS]: "bg-violet-100 text-violet-800 border border-violet-200",
    //     [UserRequestStatusTypes.PENDING_CORRECTION]: "bg-teal-100 text-teal-800 border border-teal-200",
    //     [UserRequestStatusTypes.COMPLETED]: "bg-success-100 text-success-800 border-success-200"
    // }

    const STATUS_STYLE_PROPERTIES = MAP_USER_REQUEST_STATUS[status]

    return <span className={cn("px-2.5 py-1 text-xs rounded-full", STATUS_STYLE_PROPERTIES.classes)}>
        {STATUS_STYLE_PROPERTIES.label}
    </span>
}

export default ServiceStatusBadge
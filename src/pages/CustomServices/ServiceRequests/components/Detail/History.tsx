import Spinner from "@/components/common/Spinner"
import { API_ROUTES } from "@/constants/api"
import useFetchQuery from "@/hooks/useFetchQuery"
import { IUserRequestServiceActivity, UserRequestActivityTypes } from "@/interfaces/requestService"
import { queryKeys } from "@/utils/cache"
import { formatDate } from "@/utils/dates"
import { CheckCircle2Icon, EyeIcon, PencilLineIcon } from "lucide-react"

interface ServiceActionsProps {
    itemId: string
}

const ServiceRequestHistory = ({ itemId }: ServiceActionsProps) => {
    const { response: activities, loading } = useFetchQuery<IUserRequestServiceActivity[]>(API_ROUTES.CUSTOM_SERVICES.GET_ACTIVITY.replace('{id}', itemId), {
        customQueryKey: queryKeys.list('service-request/activity', { itemId })
    })

    return (
        loading ? (
            <Spinner />
        ) : (
            <ul className="space-y-3 max-h-64 overflow-auto pr-1">
                {(activities?.data || [])
                    .map((h) => (
                        <li key={h.id} className="flex items-start gap-3">
                            {h.activity_type === UserRequestActivityTypes.REQUEST_CORRECTION ? (
                                <PencilLineIcon className="h-4 w-4 mt-0.5 text-emerald-600" />
                            ) : h.activity_type === UserRequestActivityTypes.UPDATE ? (
                                <CheckCircle2Icon className="h-4 w-4 mt-0.5 text-violet-600" />
                            ) : (
                                <EyeIcon className="h-4 w-4 mt-0.5 text-teal-600" />
                            )}
                            <div>
                                <p className="text-sm">{h.activity_description}</p>
                                <p className="text-xs text-muted-foreground">{formatDate(h.created_at)}</p>
                            </div>
                        </li>
                    ))}
            </ul>
        )
    )
}

export default ServiceRequestHistory
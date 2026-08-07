import { CheckCircle2Icon, EyeIcon, HistoryIcon, PencilLineIcon } from 'lucide-react'

import Spinner from '@/components/common/Spinner'
import { API_ROUTES } from '@/constants/api'
import useFetchQuery from '@/hooks/useFetchQuery'
import { IUserRequestServiceActivity, UserRequestActivityTypes } from '@/interfaces/requestService'
import { cn } from '@/lib/utils'
import { queryKeys } from '@/utils/cache'
import { formatDate } from '@/utils/dates'
import WorkspaceSection from './WorkspaceSection'

const ACTIVITY_STYLE: Record<UserRequestActivityTypes, { icon: typeof EyeIcon, classes: string }> = {
    [UserRequestActivityTypes.REQUEST_CORRECTION]: { icon: PencilLineIcon, classes: 'bg-rose-50 text-rose-600' },
    [UserRequestActivityTypes.UPDATE]: { icon: CheckCircle2Icon, classes: 'bg-primary/[0.08] text-primary' },
    [UserRequestActivityTypes.COMMENT]: { icon: EyeIcon, classes: 'bg-teal-50 text-teal-600' },
}

interface Props {
    itemId: string
}

/** Historial de actividad del servicio como línea de tiempo. */
const HistorySection = ({ itemId }: Props) => {
    const { response: activities, loading } = useFetchQuery<IUserRequestServiceActivity[]>(
        API_ROUTES.CUSTOM_SERVICES.GET_ACTIVITY.replace('{id}', itemId),
        {
            customQueryKey: queryKeys.list('service-request/activity', { itemId }),
        }
    )

    const items = activities?.data ?? []

    return (
        <WorkspaceSection icon={<HistoryIcon aria-hidden />} title="Historial">
            {loading && <Spinner />}

            {!loading && items.length === 0 && (
                <p className="text-xs font-semibold text-muted-foreground">Aún no hay actividad registrada.</p>
            )}

            {!loading && items.length > 0 && (
                <ul className="max-h-56 overflow-y-auto pr-1">
                    {items.map(activity => {
                        const { icon: Icon, classes } = ACTIVITY_STYLE[activity.activity_type] ?? ACTIVITY_STYLE[UserRequestActivityTypes.COMMENT]

                        return (
                            <li key={activity.id} className="relative flex gap-2.5 py-1.5 not-last:before:absolute not-last:before:top-8 not-last:before:bottom-0 not-last:before:left-[11px] not-last:before:w-0.5 not-last:before:bg-border/70">
                                <span className={cn('z-10 grid size-6 shrink-0 place-content-center rounded-full', classes)}>
                                    <Icon className="size-3" aria-hidden />
                                </span>
                                <div className="min-w-0">
                                    <p className="text-[12.5px] leading-snug font-medium">{activity.activity_description}</p>
                                    <time className="text-[10.5px] font-semibold text-muted-foreground">{formatDate(activity.created_at)}</time>
                                </div>
                            </li>
                        )
                    })}
                </ul>
            )}
        </WorkspaceSection>
    )
}

export default HistorySection

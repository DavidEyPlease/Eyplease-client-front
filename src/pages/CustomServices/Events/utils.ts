import { IconFacebook } from "@/components/Svg/IconFacebook"
import { IconWorld } from "@/components/Svg/IconWorld"
import { IconZoom } from "@/components/Svg/IconZoom"
import { EventOnlineData, EventOnlinePlatform } from "@/interfaces/events"
import { UserRequestStatusTypes } from "@/interfaces/requestService"

/** Píldora del evento en el calendario. */
export const CALENDAR_EVENT_CLASSES = 'block cursor-pointer truncate rounded-md px-1.5 py-0.5 text-[10px] font-bold text-white shadow-sm'

/** Gradiente de la píldora según el estado del servicio ligado (misma paleta que los chips de estado). */
export const CALENDAR_EVENT_STATUS_CLASSES: Record<UserRequestStatusTypes, string> = {
    [UserRequestStatusTypes.UNASSIGNED]: 'bg-linear-to-br from-amber-400 to-amber-600',
    [UserRequestStatusTypes.IN_PROGRESS]: 'bg-primary-gradient',
    [UserRequestStatusTypes.PENDING_CORRECTION]: 'bg-linear-to-br from-rose-500 to-rose-700',
    [UserRequestStatusTypes.READY_FOR_REVIEW]: 'bg-linear-to-br from-teal-500 to-teal-700',
    [UserRequestStatusTypes.COMPLETED]: 'bg-linear-to-br from-emerald-500 to-emerald-700',
    [UserRequestStatusTypes.READY_FOR_PUBLISH]: 'bg-linear-to-br from-blue-500 to-blue-700',
}

export const ONLINE_DATA_LABELS_MAP: { [key in EventOnlinePlatform]: { title: string, value: keyof EventOnlineData, icon: React.FC } } = {
    [EventOnlinePlatform.ZOOM]: {
        title: 'ID de Zoom',
        value: 'zoom_id',
        icon: IconZoom
    },
    [EventOnlinePlatform.FACEBOOK]: {
        title: 'Grupo de Facebook',
        value: 'facebook_group',
        icon: IconFacebook
    },
    [EventOnlinePlatform.OTHER]: {
        title: 'Link del evento',
        value: 'event_link',
        icon: IconWorld
    }
}
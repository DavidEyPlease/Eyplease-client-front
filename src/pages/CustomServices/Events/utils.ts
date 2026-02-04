import { IconFacebook } from "@/components/Svg/IconFacebook"
import { IconWorld } from "@/components/Svg/IconWorld"
import { IconZoom } from "@/components/Svg/IconZoom"
import { EventOnlineData, EventOnlinePlatform } from "@/interfaces/events"

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
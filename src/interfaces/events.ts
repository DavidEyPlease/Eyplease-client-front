import { UserRequestService } from "./requestService"

export enum EventType {
    ONLINE = 'online',
    PRESENTIAL = 'presential',
}

export enum EventOnlinePlatform {
    ZOOM = 'zoom',
    FACEBOOK = 'facebook',
    OTHER = 'other',
}

export type EventOnlineData = {
    platforms: EventOnlinePlatform[]
    event_link?: string
    facebook_group?: string
    zoom_id?: string
}

export interface EventDate {
    id: string
    start_date: Date
    end_date: Date
    location: string
}

export interface IEvent {
    id: string
    title: string
    description: string | null
    start_date: Date
    event_type: EventType
    dates: EventDate[]
    online_data: EventOnlineData | null
    service: UserRequestService | null
}
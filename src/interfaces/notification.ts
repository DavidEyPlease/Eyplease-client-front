import { IBaseDBProperties } from "./common"

export type NotificationType = "success" | "error" | "warning" | "info"

type NotificationData = {
    title: string
    description: string
    [key: string]: any
}

export interface INotification extends IBaseDBProperties {
    read_at: string | null
    data: NotificationData | null
    // type: "info" | "success" | "warning" | "error"
}
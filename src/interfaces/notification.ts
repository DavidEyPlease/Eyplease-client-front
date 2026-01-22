export type NotificationType = "success" | "error" | "warning" | "info"

export interface INotification {
    id: string
    title: string
    message: string
    time: string
    read: boolean
    type: "info" | "success" | "warning" | "error"
}
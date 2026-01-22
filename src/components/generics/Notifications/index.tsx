"use client"

import { useState } from "react"
import { Bell, Check, Dot, Settings, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuLabel,
    DropdownMenuTrigger,
    DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { INotification } from "@/interfaces/notification"

// Datos de ejemplo
const mockNotifications: INotification[] = [
    {
        id: "1",
        title: "Nueva actualización disponible",
        message: "La versión 2.1.0 está lista para instalar con nuevas características.",
        time: "hace 5 min",
        read: false,
        type: "info",
    },
    {
        id: "2",
        title: "Backup completado",
        message: "Tu copia de seguridad se ha realizado exitosamente.",
        time: "hace 1 hora",
        read: false,
        type: "success",
    },
    {
        id: "3",
        title: "Espacio de almacenamiento bajo",
        message: "Solo queda 15% de espacio disponible en tu cuenta.",
        time: "hace 2 horas",
        read: true,
        type: "warning",
    },
    {
        id: "4",
        title: "Error de sincronización",
        message: "No se pudieron sincronizar algunos archivos. Revisa tu conexión.",
        time: "hace 3 horas",
        read: true,
        type: "error",
    },
    {
        id: "5",
        title: "Nuevo comentario",
        message: "María comentó en tu publicación 'Proyecto de diseño'.",
        time: "hace 1 día",
        read: true,
        type: "info",
    },
]

export function NotificationsDropdown() {
    const [notifications, setNotifications] = useState<INotification[]>(mockNotifications)
    const [isOpen, setIsOpen] = useState(false)

    const unreadCount = notifications.filter((n) => !n.read).length

    const markAsRead = (id: string) => {
        setNotifications((prev) =>
            prev.map((notification) => (notification.id === id ? { ...notification, read: true } : notification)),
        )
    }

    const markAllAsRead = () => {
        setNotifications((prev) => prev.map((notification) => ({ ...notification, read: true })))
    }

    const removeNotification = (id: string) => {
        setNotifications((prev) => prev.filter((n) => n.id !== id))
    }

    const getNotificationIcon = (type: string) => {
        const iconClass = "h-2 w-2"
        switch (type) {
            case "success":
                return <Dot className={`${iconClass} text-success`} />
            case "warning":
                return <Dot className={`${iconClass} text-warning`} />
            case "error":
                return <Dot className={`${iconClass} text-destructive`} />
            default:
                return <Dot className={`${iconClass} text-info`} />
        }
    }

    return (
        <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="relative">
                    <Bell className="h-5 w-5" />
                    {unreadCount > 0 && (
                        <Badge
                            variant="destructive"
                            className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
                        >
                            {unreadCount > 9 ? "9+" : unreadCount}
                        </Badge>
                    )}
                </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end" className="w-80">
                <div className="flex items-center justify-between p-4">
                    <DropdownMenuLabel className="p-0 font-semibold">Notificaciones</DropdownMenuLabel>
                    {unreadCount > 0 && (
                        <Button variant="ghost" size="sm" onClick={markAllAsRead} className="text-xs h-auto p-1">
                            Marcar todas como leídas
                        </Button>
                    )}
                </div>

                <DropdownMenuSeparator />

                <ScrollArea className="h-96">
                    {notifications.length === 0 ? (
                        <div className="p-4 text-center text-muted-foreground">
                            <Bell className="h-8 w-8 mx-auto mb-2 opacity-50" />
                            <p className="text-sm">No tienes notificaciones</p>
                        </div>
                    ) : (
                        <div className="space-y-1">
                            {notifications.map((notification) => (
                                <div
                                    key={notification.id}
                                    className={`p-3 hover:bg-muted/50 cursor-pointer border-l-2 transition-colors ${notification.read ? "border-l-transparent opacity-70" : "border-l-primary bg-muted/20"
                                        }`}
                                    onClick={() => !notification.read && markAsRead(notification.id)}
                                >
                                    <div className="flex items-start justify-between gap-2">
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-1">
                                                {getNotificationIcon(notification.type)}
                                                <h4
                                                    className={`text-sm font-medium truncate ${notification.read ? "text-muted-foreground" : "text-foreground"
                                                        }`}
                                                >
                                                    {notification.title}
                                                </h4>
                                            </div>
                                            <p className="text-xs text-muted-foreground line-clamp-2 mb-1">{notification.message}</p>
                                            <p className="text-xs text-muted-foreground">{notification.time}</p>
                                        </div>

                                        <div className="flex items-center gap-1">
                                            {!notification.read && (
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-6 w-6"
                                                    onClick={(e) => {
                                                        e.stopPropagation()
                                                        markAsRead(notification.id)
                                                    }}
                                                >
                                                    <Check className="h-3 w-3" />
                                                </Button>
                                            )}
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-6 w-6"
                                                onClick={(e) => {
                                                    e.stopPropagation()
                                                    removeNotification(notification.id)
                                                }}
                                            >
                                                <X className="h-3 w-3" />
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </ScrollArea>

                <DropdownMenuSeparator />

                <div className="p-2">
                    <Button variant="ghost" className="w-full justify-start" size="sm">
                        <Settings className="h-4 w-4 mr-2" />
                        Configurar notificaciones
                    </Button>
                </div>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}

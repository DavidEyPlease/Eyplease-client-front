import { useCallback, useState } from "react"
import { Bell } from "lucide-react"
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
import useNotifications from "./useNotifications"
import { formatDate } from "@/utils/dates"
import { INotification } from "@/interfaces/notification"

export function NotificationsDropdown() {
    const [isOpen, setIsOpen] = useState(false)
    const { notifications, unreadCount, markAsRead } = useNotifications()

    const onOpenChange = useCallback((open: boolean) => {
        setIsOpen(open)
        if (open) markAsRead()
    }, [markAsRead])

    const onOpenNotification = (notification: INotification) => console.log(notification)

    return (
        <DropdownMenu open={isOpen} onOpenChange={onOpenChange}>
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
                <div className="flex items-center justify-between p-2">
                    <DropdownMenuLabel className="p-0 font-semibold">Notificaciones</DropdownMenuLabel>
                    {/* {unreadCount > 0 && (
                        <Button variant="ghost" size="sm" onClick={markAllAsRead} className="text-xs h-auto p-1">
                            Marcar todas como leídas
                        </Button>
                    )} */}
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
                                <button
                                    key={notification.id}
                                    className={`p-3 hover:bg-muted/50 cursor-pointer text-left
                                         border-l-2 transition-colors ${notification.read_at ? "border-l-transparent opacity-70" : "border-l-primary bg-muted/20"
                                        }`}
                                    onClick={() => onOpenNotification(notification)}
                                >
                                    <div className="flex items-center gap-2 mb-1">
                                        <Bell className={`size-5 text-primary`} />
                                        <h4
                                            className={`text-xs font-medium ${notification.read_at ? "text-muted-foreground" : "text-foreground"
                                                }`}
                                        >
                                            {notification.data?.title}
                                        </h4>
                                    </div>
                                    {/* <p className="text-xs text-muted-foreground mb-1">{notification.data?.description}</p> */}
                                    <p className="text-[10px] text-muted-foreground">{formatDate(notification.created_at, { formatter: 'DD MMMM YYYY, hh:mm A' })}</p>
                                </button>
                            ))}
                        </div>
                    )}
                </ScrollArea>

                {/* <DropdownMenuSeparator />

                <div className="p-2">
                    <Button variant="ghost" className="w-full justify-start" size="sm">
                        <Settings className="h-4 w-4 mr-2" />
                        Configurar notificaciones
                    </Button>
                </div> */}
            </DropdownMenuContent>
        </DropdownMenu>
    )
}

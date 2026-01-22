"use client"

import { useState, useEffect } from "react"
import { X, CheckCircle, AlertCircle, AlertTriangle, Info } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { INotification } from "@/interfaces/notification"

interface NotificationItemProps {
    notification: INotification
    onRemove: (id: string) => void
}

const iconMap = {
    success: CheckCircle,
    error: AlertCircle,
    warning: AlertTriangle,
    info: Info,
}

const colorMap = {
    success: "border-success/20 bg-success/5 text-success-foreground",
    error: "border-destructive/20 bg-destructive/5 text-destructive-foreground",
    warning: "border-warning/20 bg-warning/5 text-warning-foreground",
    info: "border-info/20 bg-info/5 text-info-foreground",
}

const iconColorMap = {
    success: "text-success",
    error: "text-destructive",
    warning: "text-warning",
    info: "text-info",
}

export function NotificationItem({ notification, onRemove }: NotificationItemProps) {
    const [isExiting, setIsExiting] = useState(false)
    const Icon = iconMap[notification.type]

    const handleRemove = () => {
        setIsExiting(true)
        setTimeout(() => {
            onRemove(notification.id)
        }, 300)
    }

    useEffect(() => {
        // Add entrance animation class
        const timer = setTimeout(() => {
            // This ensures the component is mounted before adding animation
        }, 10)
        return () => clearTimeout(timer)
    }, [])

    return (
        <Card
            className={cn(
                "relative overflow-hidden border transition-all duration-300 ease-out",
                "notification-fade-in",
                colorMap[notification.type],
                isExiting && "notification-exit",
            )}
        >
            <div className="flex items-start gap-3 p-4">
                <Icon className={cn("h-5 w-5 mt-0.5 flex-shrink-0", iconColorMap[notification.type])} />

                <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-semibold text-balance leading-tight">{notification.title}</h4>
                    {notification.message && (
                        <p className="text-sm text-muted-foreground mt-1 text-pretty leading-relaxed">{notification.message}</p>
                    )}

                    {/* {notification.action && (
            <Button
              variant="ghost"
              size="sm"
              className="mt-2 h-8 px-2 text-xs font-medium"
              onClick={notification.action.onClick}
            >
              {notification.action.label}
            </Button>
          )} */}
                </div>

                <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0 text-muted-foreground hover:text-foreground flex-shrink-0"
                    onClick={handleRemove}
                >
                    <X className="h-4 w-4" />
                    <span className="sr-only">Cerrar notificación</span>
                </Button>
            </div>
        </Card>
    )
}

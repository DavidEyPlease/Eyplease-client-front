import { IconNotification } from "@/components/Svg/IconNotification"
import useAuth from "@/hooks/useAuth"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { IAuthUser } from "@/interfaces/auth"

interface Props {
    user: IAuthUser
}

const Preferences = ({ user }: Props) => {
    const { updateUser } = useAuth()

    return (
        <Card className="p-0 gap-2 py-4">
            <CardHeader className="px-4">
                <p className="font-semibold">Preferencias de usuario</p>
            </CardHeader>
            <CardContent className="px-4">
                <div className="flex items-center p-4 space-x-4 border rounded-md w-max">
                    <IconNotification />
                    <div className="flex-1 space-y-1">
                        <p className="text-sm font-medium leading-none">
                            Notificaciones
                        </p>
                        <p className="text-sm text-muted-foreground">
                            Recibe notificaciones
                        </p>
                    </div>
                    <Switch checked={user.on_notifications} onCheckedChange={(e) => updateUser({ onNotifications: e })} />
                </div>
            </CardContent>
        </Card>
    )
}

export default Preferences
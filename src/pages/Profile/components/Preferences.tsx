import { IconNotification } from "@/components/Svg/IconNotification"
import { IconPreferences } from "@/components/Svg/IconPreferences"
import { Switch } from "@/components/ui/switch"
import useAuth from "@/hooks/useAuth"
import { IAuthUser } from "@/interfaces/auth"
import SectionCard from "./SectionCard"

interface Props {
    user: IAuthUser
}

const Preferences = ({ user }: Props) => {
    const { updateUser } = useAuth()

    return (
        <SectionCard
            icon={<IconPreferences aria-hidden />}
            title="Preferencias"
            description="Controla cómo te acompaña eyplease"
        >
            <div className="flex max-w-xl items-center gap-3.5 rounded-2xl border p-4 transition-colors hover:bg-surface-soft">
                <span className="grid size-9 shrink-0 place-content-center rounded-xl bg-primary/[0.08] text-primary [&_svg]:size-4.5">
                    <IconNotification aria-hidden />
                </span>
                <div className="min-w-0 flex-1">
                    <p className="text-[13px] font-bold tracking-tight">Notificaciones</p>
                    <p className="text-[11.5px] font-medium text-muted-foreground">
                        Avisos de nuevos diseños, boletines y publicaciones
                    </p>
                </div>
                <Switch
                    checked={user.on_notifications}
                    onCheckedChange={(checked) => updateUser({ onNotifications: checked })}
                />
            </div>
        </SectionCard>
    )
}

export default Preferences

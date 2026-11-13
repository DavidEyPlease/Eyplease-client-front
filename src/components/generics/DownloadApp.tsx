import StoreBadge from "@/components/generics/StoreBadge"
import useDeviceOS from "@/hooks/useDeviceOS"
import useAuthStore from "@/store/auth"
import { STORE_URLS } from "@/constants/countries"
import { cn } from "@/lib/utils"

interface Props {
    className?: string
}

/**
 * El final de todo registro: que baje la app, con el botón de su tienda (en el celular, sólo el de su sistema) y con
 * qué entra. Lo usan la cuenta lista y el Standard recién pagado (David, 12-nov-2026: «el registro debe decirles al
 * final que descarguen la app»). Se entra con el número de consultora (`username`), no con el correo.
 */
const DownloadApp = ({ className }: Props) => {
    const os = useDeviceOS()
    const account = useAuthStore(state => state.user?.account)

    const showIOS = os === 'ios' || os === 'desktop'
    const showAndroid = os === 'android' || os === 'desktop'
    const isMobile = os === 'ios' || os === 'android'

    return (
        <div className={cn("text-center", className)}>
            <p className="text-[16px] font-extrabold">
                {isMobile
                    ? 'Ahora descarga la app'
                    : 'Ahora descarga la app en tu celular'}
            </p>
            <p className="mt-1 mb-5 text-[13.5px] text-muted-foreground">
                Ahí entras con tu número de consultora{account ? <> (<b className="text-foreground">{account}</b>)</> : null} y
                la contraseña que acabas de crear.
            </p>

            <div className={cn(
                "mx-auto flex max-w-xs flex-col items-stretch gap-3",
                "sm:max-w-none sm:flex-row sm:justify-center"
            )}>
                {showIOS && <StoreBadge variant="ios" href={STORE_URLS.ios} className="dark:ring-1 dark:ring-white/15" />}
                {showAndroid && <StoreBadge variant="android" href={STORE_URLS.android} className="dark:ring-1 dark:ring-white/15" />}
            </div>

            {os === 'desktop' && (
                <p className="mt-5 text-[12.5px] text-muted-foreground">
                    Abre desde tu celular o búscanos en la tienda como{' '}
                    <b className="text-foreground">Eyplease+</b>
                </p>
            )}
        </div>
    )
}

export default DownloadApp

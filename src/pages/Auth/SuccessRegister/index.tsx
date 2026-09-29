import { useMemo } from "react"
import { useNavigate } from "react-router"
import { ArrowRight, Check } from "lucide-react"

import SignUpWizardLayout from "@/layouts/SignUpWizardLayout"
import StoreBadge from "@/components/generics/StoreBadge"
import useDeviceOS from "@/hooks/useDeviceOS"
import { APP_ROUTES } from "@/constants/app"
import { STORE_URLS } from "@/constants/countries"
import { cn } from "@/lib/utils"

const SuccessRegisterPage = () => {
    const navigate = useNavigate()
    const os = useDeviceOS()

    const email = useMemo(() => {
        const search = new URLSearchParams(window.location.search)
        return search.get('email') || ''
    }, [])

    const showIOS = os === 'ios' || os === 'desktop'
    const showAndroid = os === 'android' || os === 'desktop'
    const isMobile = os === 'ios' || os === 'android'

    return (
        <SignUpWizardLayout showClose={false}>
            <div className="text-center">
                <span className="shell-grad shell-orb mx-auto grid size-[72px] place-items-center rounded-full">
                    <Check className="relative size-9 text-white" strokeWidth={3} />
                </span>

                <p className="su-accent mt-5 text-[11.5px] font-bold tracking-[.14em] uppercase">
                    Tu cuenta está lista
                </p>
                <h2 className="mt-2 text-[28px] leading-[1.1] font-extrabold tracking-tight">
                    Bienvenida a Eyplease+
                </h2>
                {email && (
                    <p className="mt-2.5 text-[14.5px] font-medium text-muted-foreground">
                        Confirmamos tu cuenta a{' '}
                        <b className="text-foreground">{email}</b>
                    </p>
                )}
            </div>

            <div className="my-7 h-px bg-border" />

            <div className="text-center">
                <p className="text-[16px] font-extrabold">
                    {isMobile
                        ? 'Descarga la app para continuar'
                        : 'Descarga la app en tu celular'}
                </p>
                <p className="mt-1 mb-5 text-[13.5px] text-muted-foreground">
                    Ahí entras con tu correo y la contraseña que acabas de crear.
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

            <div className="mt-7 flex justify-center">
                <button
                    type="button"
                    onClick={() => navigate(APP_ROUTES.HOME.INITIAL)}
                    className="inline-flex h-11 items-center gap-1.5 rounded-full border border-border px-5 text-sm font-bold transition-colors hover:bg-muted dark:border-white/15"
                >
                    Ir a mi cuenta
                    <ArrowRight className="size-4" />
                </button>
            </div>
        </SignUpWizardLayout>
    )
}

export default SuccessRegisterPage

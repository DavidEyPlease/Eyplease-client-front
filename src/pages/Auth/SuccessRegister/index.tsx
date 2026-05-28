import { useMemo } from "react"
import { useNavigate } from "react-router"
import { Sparkles, ArrowRight } from "lucide-react"

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
                <div className="flex justify-center mb-5">
                    <div className="relative flex items-center justify-center w-20 h-20 rounded-full shadow-lg bg-eyp-gradient shadow-eyp-violet/30">
                        <Sparkles className="w-9 h-9 text-white" strokeWidth={2.5} />
                        <span className="absolute inset-0 rounded-full bg-eyp-gradient opacity-30 blur-xl" aria-hidden="true" />
                    </div>
                </div>

                <p className="mb-2 text-xs font-semibold tracking-wider uppercase text-eyp-cyan">
                    Tu cuenta está lista
                </p>
                <h2 className="text-3xl font-extrabold leading-tight font-display text-eyp-ink">
                    Bienvenida a Eyplease+
                </h2>
                {email && (
                    <p className="mt-3 text-sm text-eyp-gray-text">
                        Confirmamos tu cuenta a{' '}
                        <b className="text-eyp-ink">{email}</b>
                    </p>
                )}
            </div>

            <div className="my-8 border-t border-eyp-gray-warm" />

            <div className="text-center">
                <p className="mb-1 text-base font-bold text-eyp-ink">
                    {isMobile
                        ? 'Descarga la app para continuar'
                        : 'Descarga la app en tu celular'}
                </p>
                <p className="mb-6 text-sm text-eyp-gray-text">
                    Ahí entras con tu correo y la contraseña que acabas de crear.
                </p>

                <div className={cn(
                    "flex flex-col items-stretch gap-3 mx-auto max-w-xs",
                    "sm:max-w-none sm:flex-row sm:justify-center"
                )}>
                    {showIOS && <StoreBadge variant="ios" href={STORE_URLS.ios} />}
                    {showAndroid && <StoreBadge variant="android" href={STORE_URLS.android} />}
                </div>

                {os === 'desktop' && (
                    <p className="mt-6 text-xs text-eyp-gray-text">
                        Abre desde tu celular o búscanos en la tienda como{' '}
                        <b className="text-eyp-ink">Eyplease+</b>
                    </p>
                )}
            </div>

            <div className="flex justify-center mt-8">
                <button
                    type="button"
                    onClick={() => navigate(APP_ROUTES.HOME.INITIAL)}
                    className="inline-flex items-center gap-1.5 text-sm font-semibold transition-colors text-eyp-violet hover:text-eyp-violet-deep"
                >
                    Ir a mi cuenta
                    <ArrowRight className="w-4 h-4" />
                </button>
            </div>
        </SignUpWizardLayout>
    )
}

export default SuccessRegisterPage

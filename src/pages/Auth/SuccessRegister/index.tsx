import { useMemo } from "react"
import { useNavigate } from "react-router"
import { ArrowRight, Check } from "lucide-react"

import SignUpWizardLayout from "@/layouts/SignUpWizardLayout"
import DownloadApp from "@/components/generics/DownloadApp"
import { APP_ROUTES } from "@/constants/app"

const SuccessRegisterPage = () => {
    const navigate = useNavigate()

    const email = useMemo(() => {
        const search = new URLSearchParams(window.location.search)
        return search.get('email') || ''
    }, [])

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

            <DownloadApp />

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

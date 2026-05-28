import { useMemo } from "react"
import { Clock, MessageCircle, ArrowRight } from "lucide-react"

import SignUpWizardLayout from "@/layouts/SignUpWizardLayout"

const PendingReviewPage = () => {

    const { email, phone } = useMemo(() => {
        const search = new URLSearchParams(window.location.search)
        return {
            email: search.get('email') || '',
            phone: search.get('phone') || '',
        }
    }, [])

    return (
        <SignUpWizardLayout showClose={false}>
            <div className="text-center">
                <div className="flex justify-center mb-5">
                    <div className="relative flex items-center justify-center w-20 h-20 rounded-full shadow-lg bg-eyp-gradient shadow-eyp-violet/30">
                        <Clock className="w-9 h-9 text-white" strokeWidth={2.5} />
                        <span className="absolute inset-0 rounded-full bg-eyp-gradient opacity-30 blur-xl" aria-hidden="true" />
                    </div>
                </div>

                <p className="mb-2 text-xs font-semibold tracking-wider uppercase text-eyp-cyan">
                    Solicitud recibida
                </p>
                <h2 className="text-3xl font-extrabold leading-tight font-display text-eyp-ink">
                    Gracias por compartir tu caso
                </h2>
                <p className="mt-3 text-sm text-eyp-gray-text">
                    Eyplease+ está enfocado en Mary Kay, pero{' '}
                    <b className="text-eyp-ink">queremos revisar tu solicitud</b> con calma para ver
                    si podemos ayudarte.
                </p>
            </div>

            <div className="my-8 border-t border-eyp-gray-warm" />

            <div className="flex flex-col gap-3">
                <div className="flex items-start gap-3 p-4 rounded-2xl bg-eyp-gradient-soft border border-eyp-cyan/30">
                    <span className="flex items-center justify-center w-10 h-10 rounded-xl bg-white shadow-sm text-eyp-violet shrink-0">
                        <MessageCircle className="w-5 h-5" />
                    </span>
                    <div className="flex-1 text-left">
                        <p className="text-sm font-bold text-eyp-ink">
                            Te contactamos en menos de 24 horas
                        </p>
                        <p className="mt-0.5 text-xs text-eyp-gray-text">
                            Te escribimos por WhatsApp{phone ? ` al número que registraste` : ''} para
                            platicar y activarte la cuenta si encaja con lo que ofrecemos.
                        </p>
                    </div>
                </div>

                {email && (
                    <p className="text-xs text-center text-eyp-gray-text">
                        Confirmación enviada a <b className="text-eyp-ink">{email}</b>
                    </p>
                )}
            </div>

            <div className="flex justify-center mt-8">
                <a
                    href={import.meta.env.VITE_WEB_URL}
                    className="inline-flex items-center gap-1.5 text-sm font-semibold transition-colors text-eyp-violet hover:text-eyp-violet-deep"
                >
                    Volver a la página de inicio
                    <ArrowRight className="w-4 h-4" />
                </a>
            </div>
        </SignUpWizardLayout>
    )
}

export default PendingReviewPage

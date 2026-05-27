import { useMemo, useState } from "react"
import { useNavigate } from "react-router"
import { toast } from "sonner"
import { ArrowLeft, ArrowRight, Loader2, Mail } from "lucide-react"

import SignUpWizardLayout from "@/layouts/SignUpWizardLayout"
import StepShell from "../components/StepShell"
import { APP_ROUTES } from "@/constants/app"
import { cn } from "@/lib/utils"
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp"

const RESEND_COOLDOWN = 30
const CODE_LENGTH = 6

const SignUpVerificationCodePage = () => {
    const navigate = useNavigate()
    const [code, setCode] = useState('')
    const [submitting, setSubmitting] = useState(false)
    const [resendCooldown, setResendCooldown] = useState(0)

    const email = useMemo(() => {
        const search = new URLSearchParams(window.location.search)
        return search.get('email') || ''
    }, [])

    const onSubmit = async () => {
        if (code.length < CODE_LENGTH) {
            toast.error('Ingresa el código de 6 dígitos')
            return
        }
        setSubmitting(true)
        // UI-only — Alejandro conectará la validación real
        await new Promise(r => setTimeout(r, 600))
        const params = new URLSearchParams({ email })
        navigate(`${APP_ROUTES.AUTH.SUCCESS_REGISTER}?${params.toString()}`)
    }

    const handleResend = () => {
        if (resendCooldown > 0) return
        toast.success('Te reenviamos el código')
        setResendCooldown(RESEND_COOLDOWN)
        const interval = setInterval(() => {
            setResendCooldown(prev => {
                if (prev <= 1) {
                    clearInterval(interval)
                    return 0
                }
                return prev - 1
            })
        }, 1000)
    }

    return (
        <SignUpWizardLayout>
            <div className="flex justify-center mb-2">
                <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-eyp-violet-pale text-eyp-violet">
                    <Mail className="w-7 h-7" />
                </div>
            </div>
            <StepShell
                eyebrow="Verificación"
                title="Verifica tu cuenta"
                description={
                    <>
                        Te enviamos un código de 6 dígitos a{' '}
                        <b className="text-eyp-ink">{email || 'tu correo'}</b>
                    </>
                }
            >
                <form
                    onSubmit={(e) => {
                        e.preventDefault()
                        onSubmit()
                    }}
                    className="flex flex-col items-center gap-6"
                >
                    <InputOTP
                        maxLength={CODE_LENGTH}
                        value={code}
                        onChange={setCode}
                        autoFocus
                        containerClassName="justify-center"
                    >
                        <InputOTPGroup className="gap-2">
                            {Array.from({ length: CODE_LENGTH }).map((_, i) => (
                                <InputOTPSlot
                                    key={i}
                                    index={i}
                                    className={cn(
                                        "w-12 h-14 text-xl font-bold border-2 rounded-2xl text-eyp-ink shadow-none",
                                        "first:rounded-l-2xl last:rounded-r-2xl border-l border-eyp-gray-warm",
                                        "data-[active=true]:border-eyp-violet data-[active=true]:ring-eyp-violet/15 data-[active=true]:ring-[4px]"
                                    )}
                                />
                            ))}
                        </InputOTPGroup>
                    </InputOTP>

                    <button
                        type="button"
                        onClick={handleResend}
                        disabled={resendCooldown > 0}
                        className="text-sm font-medium underline transition-colors text-eyp-gray-text hover:text-eyp-violet disabled:opacity-60 disabled:no-underline"
                    >
                        {resendCooldown > 0
                            ? `Reenviar código en ${resendCooldown}s`
                            : '¿No te llegó? Reenviar código'}
                    </button>
                </form>
            </StepShell>

            <div className="flex items-center justify-between gap-3 mt-8">
                <button
                    type="button"
                    onClick={() => navigate(-1)}
                    disabled={submitting}
                    className="inline-flex items-center gap-1.5 text-sm font-semibold text-eyp-gray-text hover:text-eyp-ink transition-colors disabled:opacity-50"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Atrás
                </button>
                <button
                    type="button"
                    onClick={onSubmit}
                    disabled={submitting}
                    className={cn(
                        "inline-flex items-center gap-2 px-6 py-3 text-sm font-semibold text-white rounded-full shadow-lg shadow-eyp-violet/30 transition-all duration-200",
                        "bg-eyp-gradient hover:shadow-xl hover:shadow-eyp-violet/40 hover:-translate-y-0.5",
                        "disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-lg"
                    )}
                >
                    {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                    Verificar código
                    {!submitting && <ArrowRight className="w-4 h-4" />}
                </button>
            </div>
        </SignUpWizardLayout>
    )
}

export default SignUpVerificationCodePage

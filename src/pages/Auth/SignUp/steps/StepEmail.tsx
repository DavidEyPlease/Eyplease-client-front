import { type UseFormRegister, type FieldErrors } from "react-hook-form"
import { Gift, Mail } from "lucide-react"

import StepShell from "../components/StepShell"
import WizardInput from "../components/WizardInput"
import type { ISignUp } from "../schema"

interface Props {
    register: UseFormRegister<ISignUp>
    errors: FieldErrors<ISignUp>
    name: string
    onEnter: () => void
    /** Aviso bajo el campo, p. ej. cuando viene invitada y el premio depende de ESTE correo */
    hint?: string
}

const StepEmail = ({ register, errors, name, onEnter, hint }: Props) => {
    const firstName = name.split(' ')[0] || ''
    const handleKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            e.preventDefault()
            onEnter()
        }
    }

    return (
        <StepShell
            eyebrow="Tu acceso"
            title={firstName ? `${firstName}, ¿cuál es tu correo?` : "¿Cuál es tu correo?"}
            description={<>Te lo enviamos solo a ti: confirmación de cuenta, comprobantes y nada de spam.</>}
        >
            <WizardInput
                type="email"
                placeholder="tu@correo.com"
                autoComplete="email"
                autoFocus
                icon={<Mail />}
                register={register("email")}
                error={errors.email?.message}
                onKeyDown={handleKey}
            />
            {hint && (
                <p className="su-soft mt-3 flex items-start gap-2.5 rounded-2xl px-3.5 py-3 text-left text-[13.5px] leading-snug font-semibold">
                    <Gift className="su-accent mt-px size-[18px] shrink-0" />
                    {hint}
                </p>
            )}
        </StepShell>
    )
}

export default StepEmail

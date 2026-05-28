import { type UseFormRegister, type FieldErrors } from "react-hook-form"
import { Mail } from "lucide-react"

import StepShell from "../components/StepShell"
import WizardInput from "../components/WizardInput"
import type { ISignUp } from "../schema"

interface Props {
    register: UseFormRegister<ISignUp>
    errors: FieldErrors<ISignUp>
    name: string
    onEnter: () => void
}

const StepEmail = ({ register, errors, name, onEnter }: Props) => {
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
                icon={<Mail className="w-5 h-5" />}
                register={register("email")}
                error={errors.email?.message}
                onKeyDown={handleKey}
            />
        </StepShell>
    )
}

export default StepEmail

import { type UseFormRegister, type FieldErrors } from "react-hook-form"
import { User } from "lucide-react"

import StepShell from "../components/StepShell"
import WizardInput from "../components/WizardInput"
import type { ISignUp } from "../schema"

interface Props {
    register: UseFormRegister<ISignUp>
    errors: FieldErrors<ISignUp>
    onEnter: () => void
}

const StepName = ({ register, errors, onEnter }: Props) => {
    const handleKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            e.preventDefault()
            onEnter()
        }
    }

    return (
        <StepShell
            eyebrow="Bienvenida"
            title="Vamos a comenzar tu registro"
            description={<>Empezamos por lo básico. <b className="text-eyp-ink">¿Cómo te llamas?</b></>}
        >
            <WizardInput
                placeholder="Tu nombre completo"
                autoComplete="name"
                autoFocus
                icon={<User className="w-5 h-5" />}
                register={register("fullName")}
                error={errors.fullName?.message}
                onKeyDown={handleKey}
            />
        </StepShell>
    )
}

export default StepName

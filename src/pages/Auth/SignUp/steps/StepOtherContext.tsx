import { type UseFormRegister, type FieldErrors, type UseFormWatch } from "react-hook-form"

import StepShell from "../components/StepShell"
import WizardTextarea from "../components/WizardTextarea"
import type { ISignUp } from "../schema"

interface Props {
    register: UseFormRegister<ISignUp>
    errors: FieldErrors<ISignUp>
    watch: UseFormWatch<ISignUp>
}

const MAX_LENGTH = 500

const StepOtherContext = ({ register, errors, watch }: Props) => {
    const text = watch('otherContext') ?? ''

    return (
        <StepShell
            eyebrow="Queremos conocerte"
            title="Cuéntanos, ¿de dónde vienes?"
            description="Eyplease+ está diseñado para Mary Kay, pero queremos escuchar tu caso. Platícanos a qué red o industria perteneces y qué te gustaría resolver."
        >
            <WizardTextarea
                placeholder="Ej. Soy líder de una red de cosmética natural en Guadalajara y queremos automatizar boletines mensuales para nuestras 40 promotoras..."
                rows={6}
                maxLength={MAX_LENGTH}
                autoFocus
                currentLength={text.length}
                register={register('otherContext')}
                error={errors.otherContext?.message}
            />

            <p className="mt-4 text-xs text-center text-eyp-gray-text">
                Revisamos tu solicitud en menos de <b className="text-eyp-ink">24 horas hábiles</b> y
                te contactamos por WhatsApp.
            </p>
        </StepShell>
    )
}

export default StepOtherContext

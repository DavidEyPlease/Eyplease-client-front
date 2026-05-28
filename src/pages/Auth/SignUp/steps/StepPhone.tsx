import { type Control, Controller, type FieldErrors } from "react-hook-form"

import StepShell from "../components/StepShell"
import WizardPhoneInput from "../components/WizardPhoneInput"
import type { ISignUp } from "../schema"

interface Props {
    control: Control<ISignUp>
    errors: FieldErrors<ISignUp>
}

const StepPhone = ({ control, errors }: Props) => {
    return (
        <StepShell
            eyebrow="Tu canal directo"
            title="¿A qué WhatsApp te escribimos?"
            description={<>Aquí te llega el código de verificación y soporte si lo necesitas. <b className="text-eyp-ink">Solo lo usamos nosotros.</b></>}
        >
            <Controller
                control={control}
                name="countryCode"
                render={({ field: countryField }) => (
                    <Controller
                        control={control}
                        name="phoneNumber"
                        render={({ field: phoneField }) => (
                            <WizardPhoneInput
                                value={{
                                    countryCode: countryField.value,
                                    number: phoneField.value,
                                }}
                                onChange={(next) => {
                                    countryField.onChange(next.countryCode)
                                    phoneField.onChange(next.number)
                                }}
                                error={errors.phoneNumber?.message || errors.countryCode?.message}
                            />
                        )}
                    />
                )}
            />
        </StepShell>
    )
}

export default StepPhone

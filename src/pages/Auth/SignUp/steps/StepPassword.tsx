import { type UseFormRegister, type FieldErrors, type UseFormWatch, type UseFormSetValue } from "react-hook-form"
import { Lock } from "lucide-react"

import StepShell from "../components/StepShell"
import WizardInput from "../components/WizardInput"
import ErrorText from "../components/ErrorText"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import type { ISignUp } from "../schema"

interface Props {
    register: UseFormRegister<ISignUp>
    errors: FieldErrors<ISignUp>
    watch: UseFormWatch<ISignUp>
    setValue: UseFormSetValue<ISignUp>
    onEnter: () => void
}

const StepPassword = ({ register, errors, watch, setValue, onEnter }: Props) => {
    const acceptTerms = watch('acceptTerms')

    const handleKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            e.preventDefault()
            onEnter()
        }
    }

    return (
        <StepShell
            eyebrow="Último paso"
            title="Crea una contraseña"
            description={<>Mínimo 8 caracteres. <b className="text-eyp-ink">Solo tú la conoces.</b></>}
        >
            <div className="flex flex-col gap-4">
                <WizardInput
                    type="password"
                    placeholder="Tu contraseña segura"
                    autoComplete="new-password"
                    autoFocus
                    icon={<Lock className="w-5 h-5" />}
                    register={register("password")}
                    error={errors.password?.message}
                    onKeyDown={handleKey}
                />

                <div className="flex items-start gap-3 p-4 rounded-xl bg-eyp-gray-warm/60">
                    <Checkbox
                        id="acceptTerms"
                        checked={!!acceptTerms}
                        onCheckedChange={(checked) =>
                            setValue('acceptTerms', (checked === true) as true)
                        }
                        className="mt-0.5 border-eyp-violet data-[state=checked]:bg-eyp-violet data-[state=checked]:text-white"
                    />
                    <Label htmlFor="acceptTerms" className="text-xs leading-relaxed cursor-pointer text-eyp-gray-text">
                        Acepto los{' '}
                        <a href="/terminos" target="_blank" className="font-semibold underline text-eyp-violet">
                            términos y condiciones
                        </a>
                        {' '}y el{' '}
                        <a href="/privacidad" target="_blank" className="font-semibold underline text-eyp-violet">
                            aviso de privacidad
                        </a>
                        .
                    </Label>
                </div>
                {errors.acceptTerms?.message && <ErrorText error={errors.acceptTerms.message} />}
            </div>
        </StepShell>
    )
}

export default StepPassword

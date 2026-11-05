import { type UseFormRegister, type FieldErrors, type UseFormWatch, type UseFormSetValue } from "react-hook-form"
import { Lock } from "lucide-react"

import StepShell from "../components/StepShell"
import WizardInput from "../components/WizardInput"
import ErrorText from "../components/ErrorText"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import type { IPlanOfferCommitment } from "@/interfaces/plans"
import type { ISignUp } from "../schema"

/** El aviso vive en la web pública: `/privacidad` no es ninguna ruta de esta web (abría una página en blanco). */
const PRIVACY_URL = `${import.meta.env.VITE_WEB_URL || 'https://eyplease.com.mx'}/politicas-privacidad/`

interface Props {
    register: UseFormRegister<ISignUp>
    errors: FieldErrors<ISignUp>
    watch: UseFormWatch<ISignUp>
    setValue: UseFormSetValue<ISignUp>
    onEnter: () => void
    /** La permanencia de su oferta (Elite y Área en el Buen Fin): una segunda casilla, obligatoria. Sin ella, nada cambia */
    commitment?: IPlanOfferCommitment | null
    /** El nombre de la promoción («Buen Fin») */
    promoLabel?: string | null
}

const CHECKBOX_CLASS = "mt-0.5 size-5 rounded-md border-[#6C47FF] data-[state=checked]:border-transparent data-[state=checked]:bg-[#6C47FF] data-[state=checked]:text-white dark:border-[#A894FF]"

const StepPassword = ({ register, errors, watch, setValue, onEnter, commitment, promoLabel }: Props) => {
    const acceptTerms = watch('acceptTerms')
    const acceptPromoTerms = watch('acceptPromoTerms')

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
            description={<>Mínimo 8 caracteres. <b className="text-foreground">Solo tú la conoces.</b></>}
        >
            <div className="flex flex-col gap-4">
                <WizardInput
                    type="password"
                    placeholder="Tu contraseña segura"
                    autoComplete="new-password"
                    autoFocus
                    icon={<Lock />}
                    register={register("password")}
                    error={errors.password?.message}
                    onKeyDown={handleKey}
                />

                <div>
                    <div className="flex items-start gap-3 rounded-2xl border border-border bg-surface-soft p-4 dark:border-white/10 dark:bg-white/[.04]">
                        <Checkbox
                            id="acceptTerms"
                            checked={!!acceptTerms}
                            onCheckedChange={(checked) =>
                                setValue('acceptTerms', (checked === true) as true)
                            }
                            className={CHECKBOX_CLASS}
                        />
                        <Label htmlFor="acceptTerms" className="block cursor-pointer text-left text-[13px] leading-relaxed font-medium text-muted-foreground">
                            Acepto los términos y condiciones y el{' '}
                            <a href={PRIVACY_URL} target="_blank" rel="noopener noreferrer" className="su-accent font-bold underline underline-offset-2">
                                aviso de privacidad
                            </a>
                            .
                        </Label>
                    </div>
                    {errors.acceptTerms?.message && <ErrorText error={errors.acceptTerms.message} />}
                </div>

                {commitment && (
                    <div>
                        <div className="flex items-start gap-3 rounded-2xl border border-border bg-surface-soft p-4 dark:border-white/10 dark:bg-white/[.04]">
                            <Checkbox
                                id="acceptPromoTerms"
                                checked={!!acceptPromoTerms}
                                onCheckedChange={(checked) =>
                                    setValue('acceptPromoTerms', checked === true, { shouldValidate: true })
                                }
                                className={CHECKBOX_CLASS}
                            />
                            <Label htmlFor="acceptPromoTerms" className="block cursor-pointer text-left text-[13px] leading-relaxed font-medium text-muted-foreground">
                                Acepto la permanencia de {commitment.months} meses{promoLabel ? ` del ${promoLabel}` : ''}: si cancelo antes, pago el
                                descuento de los meses que usé.{' '}
                                <a href={commitment.terms_url} target="_blank" rel="noopener noreferrer" className="su-accent font-bold underline underline-offset-2">
                                    Ver términos
                                </a>
                            </Label>
                        </div>
                        {errors.acceptPromoTerms?.message && <ErrorText error={errors.acceptPromoTerms.message} />}
                    </div>
                )}
            </div>
        </StepShell>
    )
}

export default StepPassword

import { type Control, Controller, type FieldErrors } from "react-hook-form"
import { Crown, Sparkles, Compass } from "lucide-react"

import StepShell from "../components/StepShell"
import OptionCard from "../components/OptionCard"
import ErrorText from "../components/ErrorText"
import type { ISignUp, UserType } from "../schema"

interface Option {
    value: UserType
    label: string
    desc: string
    Icon: typeof Crown
}

const OPTIONS: Option[] = [
    {
        value: 'director',
        label: 'Soy Directora',
        desc: 'Lidero una unidad Mary Kay y quiero automatizar boletines y reconocimientos.',
        Icon: Crown,
    },
    {
        value: 'consultant',
        label: 'Soy Consultora',
        desc: 'Atiendo a mis clientas y quiero herramientas para vender más.',
        Icon: Sparkles,
    },
    {
        value: 'other',
        label: 'Otro',
        desc: 'Pertenezco a otra red o industria y quiero contarles mi caso.',
        Icon: Compass,
    },
]

interface Props {
    control: Control<ISignUp>
    errors: FieldErrors<ISignUp>
}

const StepUserType = ({ control, errors }: Props) => {
    return (
        <StepShell
            eyebrow="Tu perfil"
            title="Platícame, ¿qué eres?"
            description="Ajustamos las funciones, planes y materiales según tu rol."
        >
            <Controller
                control={control}
                name="userType"
                render={({ field }) => (
                    <div className="flex flex-col gap-2.5" role="radiogroup" aria-label="Selecciona tu perfil">
                        {OPTIONS.map(opt => (
                            <OptionCard
                                key={opt.value}
                                label={opt.label}
                                description={opt.desc}
                                Icon={opt.Icon}
                                selected={field.value === opt.value}
                                onClick={() => field.onChange(opt.value)}
                            />
                        ))}
                    </div>
                )}
            />
            {errors.userType?.message && <ErrorText error={errors.userType.message} />}
        </StepShell>
    )
}

export default StepUserType

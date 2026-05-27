import { type Control, Controller, type FieldErrors } from "react-hook-form"
import { Crown, Sparkles, Compass, Check } from "lucide-react"

import StepShell from "../components/StepShell"
import ErrorText from "../components/ErrorText"
import type { ISignUp, UserType } from "../schema"
import { cn } from "@/lib/utils"

interface Option {
    value: UserType
    label: string
    desc: string
    Icon: typeof Crown
}

const OPTIONS: Option[] = [
    {
        value: 'directora',
        label: 'Soy Directora',
        desc: 'Lidero una unidad Mary Kay y quiero automatizar boletines y reconocimientos.',
        Icon: Crown,
    },
    {
        value: 'consultora',
        label: 'Soy Consultora',
        desc: 'Atiendo a mis clientas y quiero herramientas para vender más.',
        Icon: Sparkles,
    },
    {
        value: 'otro',
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
                    <div className="flex flex-col gap-3" role="radiogroup" aria-label="Selecciona tu perfil">
                        {OPTIONS.map(opt => {
                            const isActive = field.value === opt.value
                            const Icon = opt.Icon
                            return (
                                <button
                                    key={opt.value}
                                    type="button"
                                    role="radio"
                                    aria-checked={isActive}
                                    onClick={() => field.onChange(opt.value)}
                                    className={cn(
                                        "group relative flex items-start gap-4 p-4 text-left transition-all rounded-2xl border-2",
                                        isActive
                                            ? "border-eyp-violet bg-eyp-violet-pale/60 shadow-md shadow-eyp-violet/10"
                                            : "border-eyp-gray-warm bg-white hover:border-eyp-violet/40 hover:bg-eyp-violet-pale/30"
                                    )}
                                >
                                    <span
                                        className={cn(
                                            "flex items-center justify-center w-11 h-11 rounded-xl shrink-0 transition-colors",
                                            isActive
                                                ? "bg-eyp-gradient text-white"
                                                : "bg-eyp-gray-warm text-eyp-violet group-hover:bg-eyp-violet-pale"
                                        )}
                                    >
                                        <Icon className="w-5 h-5" />
                                    </span>
                                    <span className="flex-1">
                                        <span className="block font-semibold text-eyp-ink">{opt.label}</span>
                                        <span className="block mt-1 text-sm text-eyp-gray-text">{opt.desc}</span>
                                    </span>
                                    <span
                                        className={cn(
                                            "flex items-center justify-center w-6 h-6 rounded-full border-2 shrink-0 transition-all",
                                            isActive
                                                ? "border-eyp-violet bg-eyp-violet text-white"
                                                : "border-eyp-gray-mid bg-white"
                                        )}
                                    >
                                        {isActive && <Check className="w-3.5 h-3.5" strokeWidth={3} />}
                                    </span>
                                </button>
                            )
                        })}
                    </div>
                )}
            />
            {errors.userType?.message && <ErrorText error={errors.userType.message} />}
        </StepShell>
    )
}

export default StepUserType

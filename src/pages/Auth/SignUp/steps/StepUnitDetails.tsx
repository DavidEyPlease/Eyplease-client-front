import { type Control, Controller, type FieldErrors } from "react-hook-form"
import { Users, Calendar } from "lucide-react"

import StepShell from "../components/StepShell"
import OptionCard from "../components/OptionCard"
import type { ISignUp } from "../schema"
import { UNIT_SIZE_OPTIONS, DIRECTOR_YEARS_OPTIONS, type UnitSize, type DirectorYears } from "@/constants/plans"

interface Props {
    control: Control<ISignUp>
    errors: FieldErrors<ISignUp>
}

const StepUnitDetails = ({ control, errors }: Props) => {
    return (
        <StepShell
            eyebrow="Tu unidad"
            title="Cuéntame de tu unidad"
            description="Con esto te recomendamos el plan que mejor encaja con tu liderazgo."
        >
            <div className="flex flex-col gap-6">
                <div>
                    <p className="flex items-center gap-2 mb-3 text-sm font-semibold text-eyp-ink">
                        <Users className="w-4 h-4 text-eyp-violet" />
                        ¿De qué tamaño es tu unidad?
                    </p>
                    <Controller
                        control={control}
                        name="unitSize"
                        render={({ field }) => (
                            <div className="flex flex-col gap-2" role="radiogroup">
                                {UNIT_SIZE_OPTIONS.map(opt => (
                                    <OptionCard
                                        key={opt.value}
                                        label={opt.label}
                                        description={opt.desc}
                                        selected={field.value === opt.value}
                                        onClick={() => field.onChange(opt.value as UnitSize)}
                                        layout="compact"
                                    />
                                ))}
                            </div>
                        )}
                    />
                    {errors.unitSize?.message && (
                        <p className="mt-1 text-xs font-medium text-left text-red-500" role="alert">
                            {errors.unitSize.message}
                        </p>
                    )}
                </div>

                <div>
                    <p className="flex items-center gap-2 mb-3 text-sm font-semibold text-eyp-ink">
                        <Calendar className="w-4 h-4 text-eyp-violet" />
                        ¿Cuánto tiempo llevas como Directora?
                    </p>
                    <Controller
                        control={control}
                        name="directorYears"
                        render={({ field }) => (
                            <div className="grid grid-cols-2 gap-2" role="radiogroup">
                                {DIRECTOR_YEARS_OPTIONS.map(opt => (
                                    <OptionCard
                                        key={opt.value}
                                        label={opt.label}
                                        selected={field.value === opt.value}
                                        onClick={() => field.onChange(opt.value as DirectorYears)}
                                        layout="compact"
                                    />
                                ))}
                            </div>
                        )}
                    />
                    {errors.directorYears?.message && (
                        <p className="mt-1 text-xs font-medium text-left text-red-500" role="alert">
                            {errors.directorYears.message}
                        </p>
                    )}
                </div>
            </div>
        </StepShell>
    )
}

export default StepUnitDetails

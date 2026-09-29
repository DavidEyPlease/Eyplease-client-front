import { type Control, Controller, type FieldErrors } from "react-hook-form"
import { Users, Calendar } from "lucide-react"

import StepShell from "../components/StepShell"
import OptionCard from "../components/OptionCard"
import ErrorText from "../components/ErrorText"
import type { ISignUp } from "../schema"
import { UNIT_SIZE_OPTIONS, DIRECTOR_YEARS_OPTIONS, type UnitSize, type DirectorYears } from "@/constants/plans"

interface Props {
    control: Control<ISignUp>
    errors: FieldErrors<ISignUp>
}

const Question = ({ Icon, children }: { Icon: typeof Users, children: React.ReactNode }) => (
    <p className="mb-2.5 flex items-center gap-2 text-[13.5px] font-bold">
        <Icon className="su-accent size-4" />
        {children}
    </p>
)

const StepUnitDetails = ({ control, errors }: Props) => {
    return (
        <StepShell
            eyebrow="Tu unidad"
            title="Cuéntame de tu unidad"
            description="Con esto te recomendamos el plan que mejor encaja con tu liderazgo."
        >
            <div className="flex flex-col gap-6">
                <div>
                    <Question Icon={Users}>¿De qué tamaño es tu unidad?</Question>
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
                    {errors.unitSize?.message && <ErrorText error={errors.unitSize.message} />}
                </div>

                <div>
                    <Question Icon={Calendar}>¿Cuánto tiempo llevas como Directora?</Question>
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
                    {errors.directorYears?.message && <ErrorText error={errors.directorYears.message} />}
                </div>
            </div>
        </StepShell>
    )
}

export default StepUnitDetails

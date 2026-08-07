import { CheckIcon } from "lucide-react"

import Button from "@/components/common/Button"
import TextInput from "@/components/common/Inputs/TextInput"
import { IconLock } from "@/components/Svg/IconLock"
import useAuth from "@/hooks/useAuth"
import useCustomForm from "@/hooks/useCustomForm"
import { IChangePasswordData } from "@/interfaces/users"
import { cn } from "@/lib/utils"
import { ChangePasswordSchema, getPasswordStrength, PASSWORD_STRENGTH_LABELS } from "../utils"
import SectionCard from "./SectionCard"

const STRENGTH_LEVELS = 4

const ChangePassword = () => {
    const { loadingAction, changePassword } = useAuth()
    const {
        register,
        handleSubmit,
        watch,
        formState: { errors },
    } = useCustomForm<IChangePasswordData>(ChangePasswordSchema, { newPassword: '', confirmPassword: '', currentPassword: '' })

    const newPassword = watch('newPassword')
    const strength = getPasswordStrength(newPassword)

    const onSubmit = handleSubmit(async (data) => {
        await changePassword(data)
    })

    return (
        <SectionCard
            icon={<IconLock aria-hidden />}
            title="Cambiar contraseña"
            description="Mínimo 8 caracteres"
        >
            <form onSubmit={onSubmit} className="flex max-w-md flex-col gap-4">
                <TextInput
                    label="Contraseña actual"
                    type="password"
                    register={register('currentPassword')}
                    error={errors.currentPassword?.message}
                />

                <div className="flex flex-col gap-1.5">
                    <TextInput
                        type="password"
                        label="Nueva Contraseña"
                        register={register("newPassword")}
                        error={errors.newPassword?.message}
                    />
                    {!!newPassword && (
                        <>
                            {/* Medidor orientativo: la validación real sigue siendo el schema */}
                            <div className="flex gap-1" aria-hidden>
                                {Array.from({ length: STRENGTH_LEVELS }, (_, index) => (
                                    <span
                                        key={index}
                                        className={cn('h-1 flex-1 rounded-full bg-border transition-colors', index < strength && 'bg-primary-gradient-r')}
                                    />
                                ))}
                            </div>
                            <span className="text-[10.5px] font-semibold text-muted-foreground">
                                Fuerza: {PASSWORD_STRENGTH_LABELS[strength]}
                            </span>
                        </>
                    )}
                </div>

                <TextInput
                    type="password"
                    label="Confirmar Nueva Contraseña"
                    register={register("confirmPassword")}
                    error={errors.confirmPassword?.message}
                />

                <Button
                    text={<><CheckIcon className="size-4" />Guardar contraseña</>}
                    type="submit"
                    rounded
                    className="w-max"
                    loading={loadingAction === 'changePassword'}
                />
            </form>
        </SectionCard>
    )
}

export default ChangePassword

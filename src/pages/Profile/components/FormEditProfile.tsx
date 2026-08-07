import { useState } from "react"
import { CheckIcon, UserRoundIcon } from "lucide-react"

import Button from "@/components/common/Button"
import TextInput from "@/components/common/Inputs/TextInput"
import useAuth from "@/hooks/useAuth"
import useCustomForm from "@/hooks/useCustomForm"
import { IAuthUser } from "@/interfaces/auth"
import { IUserUpdate } from "@/interfaces/users"
import { EditProfileSchema } from "../utils"
import SectionCard from "./SectionCard"

interface Props {
    user: IAuthUser
}

/** Datos personales con edición directa, sin modal. */
const FormEditProfile = ({ user }: Props) => {
    const [loadingAction, setLoadingAction] = useState('')
    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useCustomForm<IUserUpdate>(EditProfileSchema, { name: user?.name, email: user?.email, phone: user?.phone })
    const { updateUser } = useAuth()

    const onSubmit = handleSubmit(async (data) => {
        try {
            setLoadingAction('updateUser')
            await updateUser(data)
        } finally {
            setLoadingAction('')
        }
    })

    return (
        <SectionCard
            icon={<UserRoundIcon aria-hidden />}
            title="Datos personales"
            description="Tu información de contacto"
        >
            <form onSubmit={onSubmit} className="flex flex-col gap-5">
                <div className="grid gap-x-5 gap-y-4 md:grid-cols-2">
                    <TextInput
                        label="Nombre Completo"
                        register={register('name')}
                        error={errors.name?.message}
                    />
                    <div className="flex flex-col gap-1">
                        <TextInput
                            label="Nombre de usuario"
                            disabled
                            value={user?.account}
                        />
                        <p className="text-[10.5px] font-semibold text-muted-foreground">El usuario no se puede cambiar</p>
                    </div>
                    <TextInput
                        label="Correo electrónico"
                        type="email"
                        register={register('email')}
                        error={errors.email?.message}
                    />
                    <TextInput
                        label="Número de teléfono"
                        type="number"
                        register={register('phone')}
                        error={errors.phone?.message}
                    />
                </div>

                <Button
                    text={<><CheckIcon className="size-4" />Guardar cambios</>}
                    type="submit"
                    rounded
                    loading={loadingAction === 'updateUser'}
                />
            </form>
        </SectionCard>
    )
}

export default FormEditProfile

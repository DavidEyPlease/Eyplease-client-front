import AuthLayout from "@/layouts/AuthLayout"

import useCustomForm from '@/hooks/useCustomForm'
import useRequest from '@/hooks/useRequest'
import { SignInSchema } from './schema'
import { useNavigate } from "react-router"
import { ApiResponse, AuthResponse } from "@/interfaces/common"
import Button from "@/components/common/Button"
import TextInput from "@/components/common/Inputs/TextInput"
import Link from "@/components/common/Link"
import { APP_ROUTES, SESSION_KEY } from "@/constants/app"
import { API_ROUTES } from "@/constants/api"
import useAuth from "@/hooks/useAuth"
import { useState } from "react"
import { toast } from "sonner"
import { LockIcon, UserIcon } from "lucide-react"

type FormData = {
    username: string
    password: string
}

const SignInPage = () => {
    const [loading, setLoading] = useState(false)
    const navigate = useNavigate()
    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useCustomForm<FormData>(SignInSchema, { username: '', password: '' })
    const { getMe } = useAuth()

    const { request } = useRequest('POST')

    const onSubmit = handleSubmit(async (data) => {
        try {
            setLoading(true)
            const response = await request<ApiResponse<AuthResponse>, FormData>(API_ROUTES.SIGN_IN, data)
            if (response.success && response.data) {
                const { token } = response.data
                localStorage.setItem(SESSION_KEY, token)
                await getMe()
                navigate(APP_ROUTES.HOME.INITIAL)
            }
        } catch (error) {
            console.error(error)
            toast.error('Error al iniciar sesión. Por favor, verifica tus credenciales e intenta de nuevo.')
        } finally {
            setLoading(false)
        }
    })

    return (
        <AuthLayout>
            <div className="w-full text-center">
                <h2 className="text-[26px] font-extrabold tracking-tight">¡Bienvenid@ de nuevo!</h2>
                <p className="mt-1.5 text-sm font-medium text-muted-foreground">Inicia sesión para continuar</p>

                <form onSubmit={onSubmit} className="mt-7">
                    <div className="flex flex-col gap-4">
                        <TextInput
                            label="Usuario"
                            placeholder="Tu usuario o cuenta"
                            register={register("username")}
                            error={errors.username?.message}
                            startContent={<UserIcon />}
                        />
                        <TextInput
                            type="password"
                            label="Contraseña"
                            placeholder="••••••••"
                            register={register("password")}
                            error={errors.password?.message}
                            startContent={<LockIcon />}
                        />
                        <div className="flex justify-end">
                            <Link text="Olvidé mi contraseña" to={APP_ROUTES.AUTH.FORGOT_PASSWORD} />
                        </div>
                    </div>

                    <Button
                        text='Entrar'
                        type="submit"
                        color="primary"
                        className="mt-7"
                        rounded
                        size="lg"
                        block
                        loading={loading}
                    />
                </form>
            </div>
        </AuthLayout>
    )
}

export default SignInPage
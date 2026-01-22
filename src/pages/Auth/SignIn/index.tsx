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
                <div className="mb-5">
                    <h2 className="mb-4 text-3xl font-bold text-gray-800">¡Bienvenid@ de nuevo!</h2>
                    <p className="text-gray-600">Inicia sesión para continuar</p>
                </div>

                <form onSubmit={onSubmit}>
                    <div className="flex flex-col gap-5 mx-auto mb-16">
                        <TextInput
                            label="Usuario"
                            register={register("username")}
                            error={errors.username?.message}
                            labelClassName="text-primary"
                            className="text-primary border border-primary"
                        />
                        <TextInput
                            type="password"
                            label="Password"
                            register={register("password")}
                            error={errors.password?.message}
                            labelClassName="text-primary"
                            className="text-primary  border border-primary"
                        />
                        <div className="flex justify-end">
                            <Link text="Olvidé mi contraseña" to={APP_ROUTES.AUTH.FORGOT_PASSWORD} />
                        </div>
                    </div>

                    <Button
                        text='Entrar'
                        type="submit"
                        color="primary"
                        rounded
                        block
                        loading={loading}
                    />
                </form>
            </div>
        </AuthLayout>
    )
}

export default SignInPage
import useAuth from "@/hooks/useAuth"
import Button from "../common/Button"
import { API_ROUTES } from "@/constants/api"
import { ApiResponse } from "@/interfaces/common"
import HttpService from '@/services/http'
import { useState } from "react"
import IconCanva from "../Svg/IconCanva"

const CanvaButtonConnect = () => {
    const { user, setUser } = useAuth()
    const [loading, setLoading] = useState(false)

    const handleAuthClick = async () => {
        try {
            setLoading(true)

            if (user?.canva_connected) {
                await HttpService.delete(API_ROUTES.CANVA.DISCONNECT)
                setUser({ ...user, canva_connected: false })
                return
            }

            const response = await HttpService.get<ApiResponse<string>>(API_ROUTES.CANVA.AUTHORIZE)

            const authWindow = window.open(
                response.data,
                '_blank',
                // 'popup,height=800,width=800'
            )

            // Escucha mensajes desde la ventana emergente
            window.addEventListener('message', (event) => {
                if (event.data === 'authorization_success') {
                    console.log('Autorización exitosa')
                    // Aquí puedes manejar el éxito, como redirigir al usuario o actualizar el estado
                } else if (event.data === 'authorization_error') {
                    console.error('Error en la autorización')
                    // Maneja el error
                }
            })

            // Verifica si la ventana emergente se cierra manualmente
            const checkWindowClosed = setInterval(() => {
                if (authWindow?.closed) {
                    clearInterval(checkWindowClosed)
                    console.log('Ventana cerrada manualmente')
                    // Aquí puedes manejar el cierre manual
                }
            }, 1000)
        } catch (error) {
            console.error('Error al iniciar la autorización', error)
        } finally {
            setLoading(false)
        }
    }

    return (
        <Button
            text={
                <div className="flex items-center gap-x-2">
                    <IconCanva />
                    {user?.canva_connected ? 'Desconectar de canva' : 'Conectar con Canva'}
                </div>
            }
            className="w-max"
            loading={loading}
            onClick={handleAuthClick}
        />
    )
}

export default CanvaButtonConnect
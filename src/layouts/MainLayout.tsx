import { useEffect, useState } from "react"
import { Navigate, Outlet, useLocation } from "react-router"
import { useQueryClient } from "@tanstack/react-query"

import { APP_ROUTES, SESSION_KEY } from "@/constants/app"
import { SidebarProvider } from "@/components/ui/sidebar"
import { BillingEnforcementProvider } from "@/components/billing/enforcement/BillingEnforcementContext"
import { AppSidebar } from "@/components/sidebar/app-sidebar"
import BootShell from "@/components/sidebar/boot-shell"
import MainContainer from "@/components/sidebar/main-container"
import UploadToastProgress from "@/components/generics/UploadToastProgress"
import ReportTaskCenter from "@/components/generics/ReportTasks/ReportTaskCenter"
import useAuthStore from "@/store/auth"

/**
 * Área autenticada. Arranca en dos puertas encadenadas: primero la sesión (/me y
 * su util-data), después el overview de facturación. Hasta que las dos han
 * respondido solo existe la shell de arranque, que no hace peticiones, así que
 * ninguna página puede pedir antes de tiempo.
 */
const MainLayout = () => {
    const location = useLocation()
    const queryClient = useQueryClient()
    const user = useAuthStore(state => state.user)
    const initialLoading = useAuthStore(state => state.initialLoading)

    /*
     * Al salir del área autenticada se vacía la caché de datos del usuario.
     * Se difiere un microtask: en este mismo commit se están desmontando las
     * queries hijas, y vaciar la caché con ellas aún suscritas las relanza.
     */
    useEffect(() => () => {
        queueMicrotask(() => queryClient.clear())
    }, [queryClient])

    const [animationKey, setAnimationKey] = useState(0)

    useEffect(() => {
        setAnimationKey((prev) => prev + 1)
    }, [location.pathname])

    if (!localStorage.getItem(SESSION_KEY)) {
        return <Navigate to={APP_ROUTES.AUTH.SIGN_IN} replace />
    }

    /* Primera puerta: sin sesión resuelta no hay app. Si /me falla, getMe redirige al login. */
    if (initialLoading || !user) {
        return <BootShell />
    }

    return (
        <section className='flex'>
            {/* Segunda puerta: el provider retiene todo esto hasta que el overview responde */}
            <BillingEnforcementProvider fallback={<BootShell />}>
                <SidebarProvider>
                    <AppSidebar />
                    <MainContainer page={location.pathname}>
                        <div key={animationKey} className="animate-fade flex flex-col flex-1 gap-4 p-4">
                            <Outlet />
                        </div>
                    </MainContainer>
                </SidebarProvider>

                <UploadToastProgress />
                <ReportTaskCenter />
            </BillingEnforcementProvider>
        </section>
    )
}

export default MainLayout

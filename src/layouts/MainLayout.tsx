import { useEffect, useState } from "react"
import { Outlet, useLocation, useNavigate } from "react-router"

import { APP_ROUTES, SESSION_KEY } from "@/constants/app"
import { SidebarProvider } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/sidebar/app-sidebar"
import MainContainer from "@/components/sidebar/main-container"
import UploadToastProgress from "@/components/generics/UploadToastProgress"
import TaskToastProgress from "@/components/generics/TaskToastProgress"

const MainLayout = () => {
    const navigate = useNavigate()
    const location = useLocation()

    const token = localStorage.getItem(SESSION_KEY)

    if (!token) {
        navigate(APP_ROUTES.AUTH.SIGN_IN)
    }

    const [animationKey, setAnimationKey] = useState(0)

    useEffect(() => {
        setAnimationKey((prev) => prev + 1)
    }, [location.pathname])

    return (
        <section className='flex'>
            <SidebarProvider>
                <AppSidebar />
                <MainContainer page={location.pathname}>
                    <div key={animationKey} className="animate-fade flex flex-col flex-1 gap-4 p-4">
                        <Outlet />
                    </div>
                </MainContainer>
            </SidebarProvider>

            <UploadToastProgress />
            <TaskToastProgress />
        </section>
    )
}

export default MainLayout
import { useEffect } from "react"

import { Navigate, Route, Routes } from "react-router"
import { APP_ROUTES } from "./constants/app"
import SignInPage from "./pages/Auth/SignIn"
import ForgotPasswordPage from "./pages/Auth/ForgotPassword"
import VerificationCodePage from "./pages/Auth/VerificationCode"
import ResetPasswordPage from "./pages/Auth/ResetPassword"
import DashboardPage from "./pages/Dashboard"
import GalleryPage from "./pages/Gallery"
import MyClientsPage from "./pages/MyClients"
import ToolsPage from "./pages/Tools"
import TrainingsPage from "./pages/Trainings"
import TrainingsFilterPage from "./pages/Trainings/Filters"
import PostsPage from "./pages/Posts"
import ReportsPage from "./pages/Reports"
import CustomServicesPage from "./pages/CustomServices"
import ProfilePage from "./pages/Profile"
import useAuth from "./hooks/useAuth"
import MainLayout from "./layouts/MainLayout"

const Router = () => {
    const { isLogged, getMe } = useAuth()

    useEffect(() => {
        getMe()
    }, [])

    return (
        <Routes>
            <Route path={APP_ROUTES.AUTH.SIGN_IN} element={isLogged ? <Navigate to='/dashboard' /> : <SignInPage />} />
            <Route path={APP_ROUTES.AUTH.FORGOT_PASSWORD} element={isLogged ? <Navigate to='/dashboard' /> : <ForgotPasswordPage />} />
            <Route path={APP_ROUTES.AUTH.FORGOT_PASSWORD_VERIFICATION_CODE} element={isLogged ? <Navigate to='/dashboard' /> : <VerificationCodePage />} />
            <Route path={APP_ROUTES.AUTH.CHANGE_PASSWORD} element={isLogged ? <Navigate to='/dashboard' /> : <ResetPasswordPage />} />
            <Route element={<MainLayout />}>
                <Route path={APP_ROUTES.HOME.INITIAL} element={<DashboardPage />} />
                <Route path={APP_ROUTES.HOME.GALLERY} element={<GalleryPage />} />
                <Route path={APP_ROUTES.HOME.MY_CLIENTS} element={<MyClientsPage />} />
                <Route path={APP_ROUTES.TOOLS} element={<ToolsPage />} />

                <Route path={APP_ROUTES.TRAININGS.LIST} element={<TrainingsPage />} />
                <Route path={APP_ROUTES.TRAININGS.FILTER} element={<TrainingsFilterPage />} />

                <Route path={APP_ROUTES.POSTS.LIST} element={<PostsPage />} />

                <Route path={APP_ROUTES.REPORTS} element={<ReportsPage />} />
                <Route path={APP_ROUTES.SERVICES} element={<CustomServicesPage />} />

                <Route path={APP_ROUTES.HOME.PROFILE} element={<ProfilePage />} />
            </Route>
        </Routes>
    )
}

export default Router
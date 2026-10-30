import { useEffect } from "react"

import { Navigate, Route, Routes } from "react-router"
import { APP_ROUTES } from "./constants/app"
import SignInPage from "./pages/Auth/SignIn"
import SignUpPage from "./pages/Auth/SignUp"
import SuccessRegisterPage from "./pages/Auth/SuccessRegister"
import PendingReviewPage from "./pages/Auth/PendingReview"
import ForgotPasswordPage from "./pages/Auth/ForgotPassword"
import VerificationCodePage from "./pages/Auth/VerificationCode"
import ResetPasswordPage from "./pages/Auth/ResetPassword"
import DashboardPage from "./pages/Dashboard"
import NewsletterPage from "./pages/Newsletter"
import NewsletterInteractivePage from "./pages/NewsletterInteractive"
import NewsletterNationalPage from "./pages/NewsletterNational"
import PlanUpgradePage from "./pages/PlanUpgrade"
import PlanStandardPage from "./pages/PlanStandard"
import IndicatorsPage from "./pages/Indicators"
import MyUnitPage from "./pages/MyUnit"
import MyDirectorsPage from "./pages/MyDirectors"
import GalleryPage from "./pages/Gallery"
import MyClientsPage from "./pages/MyClients"
import ToolsPage from "./pages/Tools"
import TrainingsPage from "./pages/Trainings"
import TrainingsFilterPage from "./pages/Trainings/Filters"
import TrainingWebPage from "./pages/Trainings/Web"
import PostsPage from "./pages/Posts"
import ReportsPage from "./pages/Reports"
import CustomServicesPage from "./pages/CustomServices"
import ProfilePage from "./pages/Profile"
import useAuth from "./hooks/useAuth"
import MainLayout from "./layouts/MainLayout"
import EstrategiaPage from "./pages/Estrategia"
import InventarioPage from "./pages/Estrategia/Inventario"
import RegaloPage from "./pages/Regalo"

const Router = () => {
    const { isLogged, getMe } = useAuth()

    useEffect(() => {
        getMe()
    }, [])

    return (
        <Routes>
            <Route path={APP_ROUTES.AUTH.SIGN_IN} element={isLogged ? <Navigate to='/dashboard' /> : <SignInPage />} />
            <Route path={APP_ROUTES.AUTH.SIGN_UP} element={isLogged ? <Navigate to='/dashboard' /> : <SignUpPage />} />
            <Route path={APP_ROUTES.AUTH.SUCCESS_REGISTER} element={<SuccessRegisterPage />} />
            <Route path={APP_ROUTES.AUTH.PENDING_REVIEW} element={<PendingReviewPage />} />
            <Route path={APP_ROUTES.AUTH.FORGOT_PASSWORD} element={isLogged ? <Navigate to='/dashboard' /> : <ForgotPasswordPage />} />
            <Route path={APP_ROUTES.AUTH.FORGOT_PASSWORD_VERIFICATION_CODE} element={isLogged ? <Navigate to='/dashboard' /> : <VerificationCodePage />} />
            <Route path={APP_ROUTES.AUTH.CHANGE_PASSWORD} element={isLogged ? <Navigate to='/dashboard' /> : <ResetPasswordPage />} />
            {/* Fuera de MainLayout: es la puerta que manda a la presentación (exige sesión por su cuenta) */}
            <Route path={APP_ROUTES.TRAININGS.WEB} element={<TrainingWebPage />} />
            {/* El boletín dinámico también va a pantalla completa: trae su propia barra y su Modo junta */}
            <Route path={APP_ROUTES.HOME.NEWSLETTER_INTERACTIVE} element={<NewsletterInteractivePage />} />
            <Route path={APP_ROUTES.HOME.NEWSLETTER_NATIONAL} element={<NewsletterNationalPage />} />
            {/* Subir de plan: una sola tarjeta, sin el marco de la web (también es adonde regresa Stripe) */}
            <Route path={APP_ROUTES.HOME.PLAN_UPGRADE} element={<PlanUpgradePage />} />
            {/* Contratar el Plan Standard de consultora con tarjeta (también es adonde regresa Stripe) */}
            <Route path={APP_ROUTES.HOME.PLAN_STANDARD} element={<PlanStandardPage />} />
            {/* La página del regalo de una consultora: pública (la abre sin cuenta con la liga de su Directora) */}
            <Route path={APP_ROUTES.GIFT} element={<RegaloPage />} />
            <Route element={<MainLayout />}>
                <Route path={APP_ROUTES.HOME.INITIAL} element={<DashboardPage />} />
                <Route path={APP_ROUTES.HOME.NEWSLETTER} element={<NewsletterPage />} />
                <Route path={APP_ROUTES.INDICATORS} element={<IndicatorsPage />} />
                <Route path={APP_ROUTES.MY_UNIT} element={<MyUnitPage />} />
                <Route path={APP_ROUTES.MY_DIRECTORS} element={<MyDirectorsPage />} />
                <Route path={APP_ROUTES.HOME.GALLERY} element={<GalleryPage />} />
                <Route path={APP_ROUTES.HOME.MY_CLIENTS} element={<MyClientsPage />} />
                {/* «Tu estrategia» de la consultora (plan Standard); la entrada va detrás de su interruptor */}
                <Route path={APP_ROUTES.STRATEGY} element={<EstrategiaPage />} />
                <Route path={APP_ROUTES.INVENTORY} element={<InventarioPage />} />
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
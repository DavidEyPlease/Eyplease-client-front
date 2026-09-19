// import useFetch from "@/hooks/useFetch"
// import CustomServicesSummary from "./components/CustomServices"
import Newsletter from "./components/Newsletter"
import HomeOverdueBanner from "@/components/billing/enforcement/HomeOverdueBanner"
import BirthdayBanner from "./components/BirthdayBanner"
import UnitFollowUp from "./components/UnitFollowUp"
import AnnualReport from "./components/AnnualReport"
import HoyPage from "@/pages/Hoy"
import { isNewShell } from "@/layouts/TopShell/useNewShell"
// import PostsSummary from "./components/Posts"
// import Tasks from "./components/Tasks"
// import ToolsSummary from "./components/Tools"
// import { API_ROUTES } from "@/constants/api"
// import { DashboardSummary } from "./types"
// import CanvaButtonConnect from "@/components/generics/CanvaButtonConnect"

const DashboardPage = () => {
    /* Con el marco nuevo la portada es el Hoy (historias + feed); el boletín pasa a su página */
    if (isNewShell()) return <HoyPage />

    return (
        <div className="grid gap-y-5">
            <HomeOverdueBanner />

            {/* Birthday Banner */}
            {<BirthdayBanner />}

            {/* Lo que le falta por enviar, antes que nada: es a lo que viene */}
            <UnitFollowUp />

            {/* Reporte anual (solo en junio) */}
            <AnnualReport />

            {/* <div className="grid gap-4 auto-rows-min md:grid-cols-3">
                <PostsSummary loading={loading} summary={response?.posts || []} />
                <CustomServicesSummary loading={loading} summary={response?.custom_services || []} />
                <ToolsSummary loading={loading} summary={response?.tools || []} />
            </div> */}
            {/* <CanvaButtonConnect /> */}
            {/* <div className="grid gap-4"> */}

            {/* <Tasks /> */}
            {/* </div> */}
            <Newsletter />
        </div>
    )
}

export default DashboardPage
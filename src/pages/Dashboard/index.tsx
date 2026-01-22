// import useFetch from "@/hooks/useFetch"
// import CustomServicesSummary from "./components/CustomServices"
import Newsletter from "./components/Newsletter"
// import PostsSummary from "./components/Posts"
// import Tasks from "./components/Tasks"
// import ToolsSummary from "./components/Tools"
// import { API_ROUTES } from "@/constants/api"
// import { DashboardSummary } from "./types"
// import CanvaButtonConnect from "@/components/generics/CanvaButtonConnect"

const DashboardPage = () => {
    // const { response, loading } = useFetch<DashboardSummary>(API_ROUTES.DASHBOARD)

    return (
        <div className="grid gap-y-5">
            {/* <div className="grid gap-4 auto-rows-min md:grid-cols-3">
                <PostsSummary loading={loading} summary={response?.posts || []} />
                <CustomServicesSummary loading={loading} summary={response?.custom_services || []} />
                <ToolsSummary loading={loading} summary={response?.tools || []} />
            </div> */}
            {/* <CanvaButtonConnect /> */}
            <div className="grid gap-4 auto-rows-min md:grid-cols-3">
                <Newsletter />
                {/* <Tasks /> */}
            </div>
        </div>
    )
}

export default DashboardPage
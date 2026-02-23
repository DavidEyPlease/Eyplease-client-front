// import useFetch from "@/hooks/useFetch"
// import CustomServicesSummary from "./components/CustomServices"
import Newsletter from "./components/Newsletter"
import BirthdayBanner from "./components/BirthdayBanner"
// import PostsSummary from "./components/Posts"
// import Tasks from "./components/Tasks"
// import ToolsSummary from "./components/Tools"
// import { API_ROUTES } from "@/constants/api"
// import { DashboardSummary } from "./types"
// import CanvaButtonConnect from "@/components/generics/CanvaButtonConnect"

const DashboardPage = () => {
    return (
        <div className="grid gap-y-5">
            {/* Birthday Banner */}
            {<BirthdayBanner />}

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
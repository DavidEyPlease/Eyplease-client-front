import { API_ROUTES } from "@/constants/api"
import useListInit from "@/hooks/useListInit"
import { CursorPaginationResponse } from "@/interfaces/common"
import { ITraining } from "@/interfaces/trainings"
import { useLocation, useParams } from "react-router"
import TrainingItem from "./components/TrainingItem"
import PageLoader from "@/components/generics/PageLoader"
import { APP_ROUTES } from "@/constants/app"
import Link from "@/components/common/Link"

const TrainingsFilterPage = () => {
    const params = useParams<{ sectionKey: string }>()
    const location = useLocation()

    const searchParams = new URLSearchParams(location.search)

    const {
        response: trainings,
        isLoading,
    } = useListInit<CursorPaginationResponse<ITraining>, { category: string }>({ endpoint: API_ROUTES.TRAININGS.FILTER, defaultFilters: { category: params.sectionKey } })

    return (
        <div>
            <div className="flex justify-between items-center mb-3 ">
                <p className="text-xl font-semibold text-dark">{searchParams.get('title')}</p>
                <Link text="Ver todos" to={APP_ROUTES.TRAININGS.LIST} />
            </div>
            {isLoading ? (
                <PageLoader />
            ) : (
                <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
                    {(trainings?.items || []).map(training => (
                        <TrainingItem key={training.id} training={training} />
                    ))}
                </div>
            )}
        </div>
    )
}

export default TrainingsFilterPage
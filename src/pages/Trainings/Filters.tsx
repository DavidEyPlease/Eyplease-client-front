import { API_ROUTES } from "@/constants/api"
import { ITraining, ITrainingListFilters, TrainingFilterTypes } from "@/interfaces/trainings"
import { useLocation, useParams } from "react-router"
import TrainingItem from "./components/TrainingItem"
import PageLoader from "@/components/generics/PageLoader"
import useInfiniteListQuery from "@/hooks/useInfiniteListQuery"
import { queryKeys } from "@/utils/cache"
import LoadMorePaginator from "@/components/generics/LoadMorePaginator"
import { Button } from "@/components/ui/button"
import { ChevronLeftIcon } from "lucide-react"

const TrainingsFilterPage = () => {
    const params = useParams<{ sectionKey: string }>()
    const location = useLocation()

    const searchParams = new URLSearchParams(location.search)
    const sectionKey = params.sectionKey

    const filters: ITrainingListFilters = { category: sectionKey || '' }

    const {
        data,
        isFetchingNextPage,
        isLoading,
        hasNextPage,
        fetchNextPage,
    } = useInfiniteListQuery<ITraining, ITrainingListFilters>(
        API_ROUTES.TRAININGS.FILTER,
        {
            queryParams: filters,
            customQueryKey: queryKeys.list('trainings-filter', filters),
            enabled: sectionKey !== undefined
        }
    )

    return (
        <div>
            <div className="flex items-center mb-3 ">
                <Button variant='ghost' size='icon' onClick={() => history.back()}>
                    <ChevronLeftIcon />
                </Button>
                <p className="text-xl font-semibold text-dark">{searchParams.get('title')}</p>
                {/* <Link text="Ver todos" to={APP_ROUTES.TRAININGS.LIST} /> */}
            </div>
            {isLoading ? (
                <PageLoader />
            ) : (
                <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
                    {(data?.pages.flatMap(page => page.items) || []).map(training => (
                        <TrainingItem
                            key={training.id}
                            training={training}
                            showRibbon={sectionKey === TrainingFilterTypes.RECENT}
                        />
                    ))}
                </div>
            )}

            {hasNextPage &&
                <LoadMorePaginator disabled={!hasNextPage} loading={isFetchingNextPage} onLoadMore={() => fetchNextPage()} />
            }
        </div>
    )
}

export default TrainingsFilterPage
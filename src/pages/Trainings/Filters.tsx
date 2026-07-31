import { API_ROUTES } from "@/constants/api"
import { ITraining, ITrainingListFilters, TrainingFilterTypes } from "@/interfaces/trainings"
import { useLocation, useParams } from "react-router"
import TrainingItem from "./components/TrainingItem"
import { TRAININGS_GRID } from "./components/TrainingSection"
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

    const isRecent = sectionKey === TrainingFilterTypes.RECENT

    return (
        <div className="pt-2">
            <div className="mb-4 flex items-center gap-1">
                <Button variant='ghost' size='icon' className="cursor-pointer" onClick={() => history.back()}>
                    <ChevronLeftIcon />
                </Button>
                <h1 className="text-lg font-extrabold tracking-tight">{searchParams.get('title')}</h1>
            </div>
            {isLoading ? (
                <div className="relative grid min-h-64 place-content-center">
                    <PageLoader />
                </div>
            ) : (
                <div className={TRAININGS_GRID}>
                    {(data?.pages.flatMap(page => page.items) || []).map(training => (
                        <TrainingItem
                            key={training.id}
                            training={training}
                            showRibbon={isRecent}
                            showCategory={isRecent}
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
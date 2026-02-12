import PageLoader from "@/components/generics/PageLoader"
import { API_ROUTES } from "@/constants/api"
import { ITraining, TrainingCategoryTypes, TrainingFilterTypes } from "@/interfaces/trainings"
import TrainingSection from "./components/TrainingSection"
import { TRANSLATE_MAP_CATEGORIES } from "@/constants/app"
import useFetchQuery from "@/hooks/useFetchQuery"
import { queryKeys } from "@/utils/cache"

const TrainingsPage = () => {
    const { response, loading } = useFetchQuery<{
        recently: { count: number, items: ITraining[] },
        groupByCategory: Record<TrainingCategoryTypes, ITraining[]>
    }>(
        API_ROUTES.TRAININGS.LIST,
        {
            customQueryKey: queryKeys.list('trainings'),
        }
    )

    return (
        <div className="grid pt-2 gap-y-2">
            {loading ? (
                <PageLoader />
            ) : (
                <div className="flex flex-col gap-6">
                    {
                        !!response?.data?.recently.count &&
                        <TrainingSection
                            title={`Recientemente añadidas (${response.data.recently.count})`}
                            sectionKey={TrainingFilterTypes.RECENT}
                            showButtonAll
                            trainings={response.data.recently.items}
                        />
                    }
                    {
                        response && response?.data?.groupByCategory && Object.keys(response.data.groupByCategory).map(category => {
                            const cat = category as TrainingCategoryTypes
                            return (
                                <TrainingSection
                                    key={category}
                                    sectionKey={cat}
                                    title={TRANSLATE_MAP_CATEGORIES[cat]}
                                    trainings={response?.data?.groupByCategory[cat] || []}
                                    showButtonAll
                                />
                            )
                        })
                    }
                </div>
            )}
        </div>
    )
}

export default TrainingsPage
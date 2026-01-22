import PageLoader from "@/components/generics/PageLoader"
import { API_ROUTES } from "@/constants/api"
import useFetch from "@/hooks/useFetch"
import { ITraining, TrainingCategoryTypes, TrainingFilterTypes } from "@/interfaces/trainings"
import TrainingSection from "./components/TrainingSection"
import { TRANSLATE_MAP_CATEGORIES } from "@/constants/app"

const TrainingsPage = () => {
    const { response, loading } = useFetch<{
        recently: {
            count: number
            items: ITraining[]
        }
        groupByCategory: Record<TrainingCategoryTypes, ITraining[]>
    }>(API_ROUTES.TRAININGS.LIST)

    return (
        <div className="grid pt-2 gap-y-2">
            {loading ? (
                <PageLoader />
            ) : (
                <div className="flex flex-col gap-6">
                    {
                        !!response?.recently.count &&
                        <TrainingSection
                            title={`Recientemente añadidas (${response.recently.count})`}
                            sectionKey={TrainingFilterTypes.RECENT}
                            showButtonAll
                            trainings={response.recently.items}
                        />
                    }
                    {
                        response && response?.groupByCategory && Object.keys(response.groupByCategory).map(category => {
                            const cat = category as TrainingCategoryTypes
                            return (
                                <TrainingSection
                                    key={category}
                                    sectionKey={cat}
                                    title={TRANSLATE_MAP_CATEGORIES[cat]}
                                    trainings={response?.groupByCategory[cat] || []}
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
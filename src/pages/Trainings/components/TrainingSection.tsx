
import { FilterType, ITraining, TrainingFilterTypes } from "@/interfaces/trainings"
import { APP_ROUTES } from "@/constants/app"
import Link from "@/components/common/Link"
import TrainingItem from "./TrainingItem"
// import TrainingFilter from "./TrainingFilter"

interface Props {
    title: string
    sectionKey: FilterType
    showButtonAll?: boolean
    trainings: ITraining[]
}

const TrainingSection = ({ title, trainings, sectionKey, showButtonAll = false }: Props) => {
    return (
        <div>
            <div className="flex items-center justify-between mb-2">
                <p className="text-lg font-semibold text-dark">{title}</p>
                {showButtonAll &&
                    <Link text="Ver todo" to={`${APP_ROUTES.TRAININGS.FILTER.replace(':sectionKey', sectionKey)}?title=${title}`} />
                }
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
                {trainings.map(training => (
                    <TrainingItem showRibbon={sectionKey === TrainingFilterTypes.RECENT} key={training.id} training={training} />
                ))}
            </div>
        </div>
    )
}

export default TrainingSection
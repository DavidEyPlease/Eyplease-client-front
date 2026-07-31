import Link from "@/components/common/Link"
import { Badge } from "@/components/ui/badge"
import { APP_ROUTES } from "@/constants/app"
import { FilterType, ITraining } from "@/interfaces/trainings"
import TrainingItem from "./TrainingItem"

/** Rejilla fluida: la portada 16:10 necesita ancho, así que se ajusta sola en vez de forzar 4 columnas. */
export const TRAININGS_GRID = 'grid gap-4 grid-cols-[repeat(auto-fill,minmax(310px,1fr))]'

interface Props {
    title: string
    sectionKey: FilterType
    showButtonAll?: boolean
    isRecent?: boolean
    trainings: ITraining[]
}

const TrainingSection = ({ title, trainings, sectionKey, isRecent = false, showButtonAll = false }: Props) => {
    return (
        <section>
            <header className="mb-3 flex items-center gap-2.5">
                <h2 className="text-base font-extrabold tracking-tight">{title}</h2>
                <Badge
                    variant="outline"
                    className="rounded-full border-border bg-surface-soft px-2.5 text-[11.5px] font-bold text-muted-foreground"
                >
                    {trainings.length}
                </Badge>
                {showButtonAll &&
                    <Link
                        text="Ver todo"
                        className="ml-auto no-underline hover:underline"
                        to={`${APP_ROUTES.TRAININGS.FILTER.replace(':sectionKey', sectionKey)}?title=${title}`}
                    />
                }
            </header>

            <div className={TRAININGS_GRID}>
                {trainings.map(training => (
                    <TrainingItem
                        key={training.id}
                        training={training}
                        showRibbon={isRecent}
                        showCategory={isRecent}
                    />
                ))}
            </div>
        </section>
    )
}

export default TrainingSection

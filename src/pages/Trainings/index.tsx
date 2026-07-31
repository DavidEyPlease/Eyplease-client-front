import { useMemo, useState } from "react"

import { EmptySection } from "@/components/generics/EmptySection"
import FilterChip from "@/components/generics/FilterChip"
import PageLoader from "@/components/generics/PageLoader"
import SearchInput from "@/components/generics/SearchInput"
import { IconTraining } from "@/components/Svg/IconTraining"
import { Badge } from "@/components/ui/badge"
import { API_ROUTES } from "@/constants/api"
import useFetchQuery from "@/hooks/useFetchQuery"
import { ITraining, TrainingCategoryTypes, TrainingFilterTypes } from "@/interfaces/trainings"
import useAuthStore from "@/store/auth"
import { queryKeys } from "@/utils/cache"
import TrainingSection from "./components/TrainingSection"
import { matchesTrainingSearch } from "./utils"

/** El endpoint devuelve todos los entrenamientos agrupados, así que buscar y filtrar es local. */
const ALL_CATEGORIES = 'all'

interface TrainingsResponse {
    recently: { count: number, items: ITraining[] }
    groupByCategory: Record<TrainingCategoryTypes, ITraining[]>
}

const TrainingsPage = () => {
    const { utilData } = useAuthStore(state => state)
    const [search, setSearch] = useState('')
    const [category, setCategory] = useState<string>(ALL_CATEGORIES)

    const { response, loading } = useFetchQuery<TrainingsResponse>(
        API_ROUTES.TRAININGS.LIST,
        {
            customQueryKey: queryKeys.list('trainings'),
        }
    )

    const data = response?.data

    const categoryNames = useMemo(
        () => new Map(utilData.training_categories.map(item => [item.slug, item.name])),
        [utilData.training_categories]
    )

    const sections = useMemo(() => {
        if (!data) return []

        const groups: { key: string, title: string, trainings: ITraining[], isRecent: boolean }[] = []

        if (data.recently.count && (category === ALL_CATEGORIES || category === TrainingFilterTypes.RECENT)) {
            groups.push({
                key: TrainingFilterTypes.RECENT,
                title: 'Recientemente añadidas',
                trainings: data.recently.items,
                isRecent: true,
            })
        }

        if (category !== TrainingFilterTypes.RECENT) {
            Object.entries(data.groupByCategory).forEach(([slug, trainings]) => {
                if (category !== ALL_CATEGORIES && category !== slug) return
                groups.push({ key: slug, title: categoryNames.get(slug) ?? '', trainings, isRecent: false })
            })
        }

        return groups
            .map(group => ({ ...group, trainings: group.trainings.filter(item => matchesTrainingSearch(item, search)) }))
            .filter(group => group.trainings.length > 0)
    }, [data, category, search, categoryNames])

    const total = useMemo(
        () => Object.values(data?.groupByCategory ?? {}).reduce((count, items) => count + items.length, 0),
        [data]
    )

    const categorySlugs = Object.keys(data?.groupByCategory ?? {})

    return (
        <div className="flex flex-col gap-5 pt-2">
            <div className="flex flex-col gap-3.5 rounded-3xl border bg-card bg-hero-glow px-5 py-4 shadow-card">
                <div className="flex flex-col items-stretch gap-3 md:flex-row md:items-center">
                    <div className="min-w-60 flex-1">
                        <SearchInput
                            placeholder="Buscar un entrenamiento…"
                            onSubmitSearch={setSearch}
                        />
                    </div>
                    {total > 0 && (
                        <Badge
                            variant="outline"
                            className="rounded-full border-primary/20 bg-primary/[0.07] px-3.5 py-1.5 text-[13px] font-bold text-primary"
                        >
                            {total} {total === 1 ? 'entrenamiento' : 'entrenamientos'}
                        </Badge>
                    )}
                </div>

                <div className="flex flex-wrap gap-2">
                    <FilterChip
                        label="Todas"
                        active={category === ALL_CATEGORIES}
                        onClick={() => setCategory(ALL_CATEGORIES)}
                    />
                    {!!data?.recently.count && (
                        <FilterChip
                            label="Recientes"
                            active={category === TrainingFilterTypes.RECENT}
                            onClick={() => setCategory(TrainingFilterTypes.RECENT)}
                        />
                    )}
                    {categorySlugs.map(slug => (
                        <FilterChip
                            key={slug}
                            label={categoryNames.get(slug) ?? ''}
                            active={category === slug}
                            onClick={() => setCategory(slug)}
                        />
                    ))}
                </div>
            </div>

            {loading && (
                <div className="relative grid min-h-64 place-content-center">
                    <PageLoader />
                </div>
            )}

            {!loading && sections.length === 0 && (
                <EmptySection
                    title="No hay resultados"
                    description="Intenta ajustar los filtros o buscar con otras palabras clave."
                    media={<IconTraining />}
                />
            )}

            {!loading && sections.map(section => (
                <TrainingSection
                    key={section.key}
                    sectionKey={section.key as TrainingCategoryTypes}
                    title={section.title}
                    trainings={section.trainings}
                    isRecent={section.isRecent}
                    showButtonAll
                />
            ))}
        </div>
    )
}

export default TrainingsPage

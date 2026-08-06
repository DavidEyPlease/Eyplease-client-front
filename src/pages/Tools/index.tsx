import { useEffect, useMemo, useState } from "react"

import { EmptySection } from "@/components/generics/EmptySection"
import LoadMorePaginator from "@/components/generics/LoadMorePaginator"
import PageLoader from "@/components/generics/PageLoader"
import SearchInput from "@/components/generics/SearchInput"
import { IconTools } from "@/components/Svg/IconTools"
import { Badge } from "@/components/ui/badge"
import { API_ROUTES } from "@/constants/api"
import { MAP_TOOLS_SECTIONS } from "@/constants/app"
import useAuth from "@/hooks/useAuth"
import useInfiniteListQuery from "@/hooks/useInfiniteListQuery"
import { PermissionKeys } from "@/interfaces/permissions"
import { ITool, IToolsFilters } from "@/interfaces/tools"
import { useToolsStore } from "@/store/tools"
import ToolFilters from "./components/Filters"
import ToolItem from "./components/ToolItem"
import useMasonryColumns from "./hooks/useMasonryColumns"

const ToolsPage = () => {
    const { hasAccess } = useAuth()
    const { filters, setFilters, getListQueryKey } = useToolsStore(state => state)

    const listQueryKey = getListQueryKey()

    const {
        data,
        isFetchingNextPage,
        isLoading,
        hasNextPage,
        fetchNextPage,
    } = useInfiniteListQuery<ITool, IToolsFilters>(
        API_ROUTES.TOOLS.LIST,
        {
            queryParams: filters,
            customQueryKey: listQueryKey,
            enabled: true,
        }
    )

    const tools = useMemo(() => data?.pages.flatMap(page => page.items) ?? [], [data])
    const columnCount = useMasonryColumns()

    /* Reparto round-robin: se lee por filas y "Cargar más" añade al final sin recolocar lo ya visto */
    const columns = useMemo(() => {
        const result: ITool[][] = Array.from({ length: columnCount }, () => [])
        tools.forEach((tool, index) => result[index % columnCount].push(tool))
        return result
    }, [tools, columnCount])

    /* El contador retiene el último total para no parpadear al cambiar de sección */
    const totalItems = data?.pages[0]?.total_items ?? 0
    const [displayTotal, setDisplayTotal] = useState(0)

    useEffect(() => {
        if (!isLoading) setDisplayTotal(totalItems)
    }, [isLoading, totalItems])

    return (
        <div className="flex flex-col gap-4">
            {/* Barra fija: búsqueda y secciones no se pierden al bajar por el mural */}
            <div className="sticky top-0 z-30 -mx-4 -mt-4 flex flex-col gap-3 border-b bg-background/85 px-4 py-3 backdrop-blur-md lg:flex-row lg:items-center">
                <div className="w-full lg:max-w-xs">
                    <SearchInput
                        value={filters.search}
                        placeholder="Buscar herramienta"
                        onSubmitSearch={(search) => setFilters({ search })}
                    />
                </div>
                <ToolFilters filters={filters} setFilter={setFilters} />
            </div>

            <div className="flex items-center gap-2.5">
                <h2 className="text-lg font-extrabold tracking-tight">{MAP_TOOLS_SECTIONS[filters.section]}</h2>
                {displayTotal > 0 && (
                    <Badge
                        variant="outline"
                        className="rounded-full border-primary/20 bg-primary/[0.07] px-3 py-1 text-xs font-bold text-primary"
                    >
                        {displayTotal} {displayTotal === 1 ? 'publicación' : 'publicaciones'}
                    </Badge>
                )}
            </div>

            {isLoading ? (
                <PageLoader />
            ) : (
                <div className="flex items-start gap-4">
                    {columns.map((columnTools, columnIndex) => (
                        <div key={columnIndex} className="flex min-w-0 flex-1 flex-col gap-4">
                            {columnTools.map(tool => (
                                <ToolItem
                                    key={tool.id}
                                    item={tool}
                                    lock={!hasAccess(tool.section.toString() as PermissionKeys)}
                                />
                            ))}
                        </div>
                    ))}
                </div>
            )}

            {tools.length === 0 && !isLoading && (
                <EmptySection
                    title="No hay resultados"
                    description="Intenta ajustar los filtros o buscar con otras palabras clave."
                    media={<IconTools />}
                />
            )}

            {hasNextPage &&
                <LoadMorePaginator disabled={!hasNextPage} loading={isFetchingNextPage} onLoadMore={() => fetchNextPage()} />
            }
        </div>
    )
}

export default ToolsPage

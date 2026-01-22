import ToolItem from "./components/ToolItem"
import { API_ROUTES } from "@/constants/api"
import PageLoader from "@/components/generics/PageLoader"
import ToolFilters from "./components/Filters"
import SearchInput from "@/components/generics/SearchInput"
import { ITool, IToolsFilters, ToolSectionTypes } from "@/interfaces/tools"
import useInfiniteListQuery from "@/hooks/useInfiniteListQuery"
import { EmptySection } from "@/components/generics/EmptySection"
import { IconTools } from "@/components/Svg/IconTools"
import LoadMorePaginator from "@/components/generics/LoadMorePaginator"

const ToolsPage = () => {
    const {
        data: tools,
        isLoading,
        isFetchingNextPage,
        hasNextPage,
        filters,
        search,
        loadMore,
        setSearch,
        setFilter
    } = useInfiniteListQuery<ITool, IToolsFilters>({
        endpoint: API_ROUTES.TOOLS.LIST,
        defaultFilters: { section: ToolSectionTypes.STAY_INFORMED },
        paginationType: 'cursor'
    })

    return (
        <div className="flex flex-col gap-5">
            <SearchInput
                value={search}
                placeholder="Buscar herramienta"
                onSubmitSearch={setSearch}
            />
            <ToolFilters filters={filters} setFilter={setFilter} />

            {isLoading ? (
                <PageLoader />
            ) : (
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {tools.map((tool) => (
                        <ToolItem key={tool.id} item={tool} />
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
                <LoadMorePaginator disabled={!hasNextPage} loading={isFetchingNextPage} onLoadMore={() => loadMore()} />
            }
        </div>
    )
}

export default ToolsPage
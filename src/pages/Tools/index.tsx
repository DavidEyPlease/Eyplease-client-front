import ToolItem from "./components/ToolItem"
import { API_ROUTES } from "@/constants/api"
import PageLoader from "@/components/generics/PageLoader"
import ToolFilters from "./components/Filters"
import SearchInput from "@/components/generics/SearchInput"
import { ITool, IToolsFilters } from "@/interfaces/tools"
import useInfiniteListQuery from "@/hooks/useInfiniteListQuery"
import { EmptySection } from "@/components/generics/EmptySection"
import { IconTools } from "@/components/Svg/IconTools"
import LoadMorePaginator from "@/components/generics/LoadMorePaginator"
import { useToolsStore } from "@/store/tools"

const ToolsPage = () => {
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

    return (
        <div className="flex flex-col gap-5">
            <SearchInput
                value={filters.search}
                placeholder="Buscar herramienta"
                onSubmitSearch={(search) => setFilters({ search })}
            />
            <ToolFilters filters={filters} setFilter={setFilters} />

            {isLoading ? (
                <PageLoader />
            ) : (
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {(data?.pages.flatMap(page => page.items) ?? []).map((tool) => (
                        <ToolItem key={tool.id} item={tool} />
                    ))}
                </div>
            )}
            {(data?.pages.flatMap(page => page.items) ?? []).length === 0 && !isLoading && (
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
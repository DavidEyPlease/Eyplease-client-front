import { useEffect, useState } from "react"

import { API_ROUTES } from "@/constants/api"
import { ISponsored, VendorFilterType } from "@/interfaces/sponsored"
import VendorItem from "./components/Item"

import SearchInput from "@/components/generics/SearchInput"
import PageLoader from "@/components/generics/PageLoader"
import LoadMorePaginator from "@/components/generics/LoadMorePaginator"
import AlphabetFilter from "@/components/generics/AlphabetFilter"
import DynamicTabs from "@/components/generics/DynamicTabs"
import { IconBySection } from "@/components/generics/IconBySection"
import { PermissionKeys } from "@/interfaces/permissions"
import { Badge } from "@/components/ui/badge"
import useInfiniteListQuery from "@/hooks/useInfiniteListQuery"
import { EmptySection } from "@/components/generics/EmptySection"
import { IconGallery } from "@/components/Svg/IconGallery"
import { useGalleryStore } from "@/store/gallery"

const GalleryPage = () => {
    const { filters, setFilters, getListQueryKey } = useGalleryStore(state => state)
    const listQueryKey = getListQueryKey()

    const {
        data: sponsoredList,
        isFetchingNextPage,
        isLoading,
        hasNextPage,
        fetchNextPage,
    } = useInfiniteListQuery<ISponsored>(
        API_ROUTES.SPONSORED.GALLERY,
        {
            queryParams: filters,
            customQueryKey: listQueryKey,
            enabled: !!filters.vendorRole
        }
    )

    const vendors = sponsoredList?.pages.flatMap(page => page.items) ?? []
    const total = sponsoredList?.pages[0]?.total_items

    // Al cambiar de tab la query se vacía un instante: se retiene el último total para que el chip no parpadee
    const [displayTotal, setDisplayTotal] = useState<number | null>(null)
    useEffect(() => {
        if (total !== undefined) setDisplayTotal(total)
    }, [total])

    return (
        <div className="flex flex-col gap-4 pt-2">
            <div className="flex flex-col gap-3.5 rounded-3xl border bg-card bg-hero-glow px-5 py-4 shadow-card">
                <div className="flex flex-col items-stretch gap-3 md:flex-row md:items-center">
                    <div className="min-w-60 flex-1">
                        <SearchInput
                            placeholder="Buscar por nombre o cuenta…"
                            onSubmitSearch={(e) => setFilters({ search: e })}
                        />
                    </div>
                    <DynamicTabs
                        items={[
                            { value: "unity", label: "Unidad", icon: <IconBySection sectionKey={PermissionKeys.POSTS_UNITY} /> },
                            { value: "directors", label: "Directoras", icon: <IconBySection sectionKey={PermissionKeys.POSTS_DIRECTORS} /> },
                        ]}
                        value={filters.vendorRole}
                        onValueChange={value => setFilters({ vendorRole: value as VendorFilterType })}
                    />
                    {displayTotal !== null && (
                        <Badge
                            variant="outline"
                            className="rounded-full border-primary/20 bg-primary/[0.07] px-3.5 py-1.5 text-[13px] font-bold text-primary"
                        >
                            {displayTotal} {displayTotal === 1 ? 'vendedora' : 'vendedoras'}
                        </Badge>
                    )}
                </div>
                <AlphabetFilter onFilter={letter => setFilters({ letter })} />
            </div>

            {isLoading && !isFetchingNextPage ? (
                <div className="relative grid min-h-64 place-content-center">
                    <PageLoader />
                </div>
            ) : (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {vendors.map(sponsored => (
                        <VendorItem key={sponsored.id} item={sponsored} />
                    ))}
                </div>
            )}

            {vendors.length === 0 && !isLoading && (
                <EmptySection
                    title="No hay resultados"
                    description="Intenta ajustar los filtros o buscar con otras palabras clave."
                    media={<IconGallery />}
                />
            )}

            {hasNextPage &&
                <LoadMorePaginator disabled={!hasNextPage} loading={isFetchingNextPage} onLoadMore={() => fetchNextPage()} />
            }
        </div>
    )
}

export default GalleryPage

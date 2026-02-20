
import { API_ROUTES } from "@/constants/api"
import { ISponsored, VendorFilterType } from "@/interfaces/sponsored"
import VendorItem from "./components/Item"

import SearchInput from "@/components/generics/SearchInput"
import PageLoader from "@/components/generics/PageLoader"
import VendorEdit from "./components/VendorEdit"
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

    return (
        <div className="grid pt-2">
            <div className="flex flex-col gap-4">
                <div className="flex flex-col items-center md:flex-row justify-between gap-4">
                    <div className="flex-1 w-full">
                        <SearchInput
                            placeholder="Buscar por nombre/cuenta"
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
                </div>
                <AlphabetFilter onFilter={letter => setFilters({ letter })} />
            </div>
            {isLoading && !isFetchingNextPage ? (
                <PageLoader />
            ) : (
                <div className="grid mt-10 gap-x-5 gap-y-14 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {(sponsoredList?.pages.flatMap(page => page.items) ?? []).map(sponsored => (
                        <VendorItem
                            key={sponsored.id}
                            item={sponsored}
                            cardBody={
                                <div className="text-center space-y-4 pt-4 relative">
                                    <div>
                                        <p className='text-sm'>{sponsored.name}</p>
                                        <p className='text-base font-semibold text-primary'>{sponsored.account}</p>
                                    </div>

                                    {!sponsored.display_in_reports && (
                                        <Badge
                                            className="dark:text-white absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2"
                                            color="secondary"
                                        >
                                            Oculta en reportes
                                        </Badge>
                                    )}
                                    <VendorEdit sponsored={sponsored} />
                                </div>
                            }
                        />
                    ))}
                </div>
            )}
            {(sponsoredList?.pages.flatMap(page => page.items) ?? []).length === 0 && !isLoading && (
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
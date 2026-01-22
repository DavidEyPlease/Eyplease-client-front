import { useCallback, useEffect } from "react"

import { API_ROUTES } from "@/constants/api"
import { GalleryFilters, ISponsored, VendorFilterType } from "@/interfaces/sponsored"
import VendorItem from "./components/Item"

import SearchInput from "@/components/generics/SearchInput"
import PageLoader from "@/components/generics/PageLoader"
import VendorEdit from "./components/VendorEdit"
import { BrowserEvent, subscribeEvent, unsubscribeEvent } from "@/utils/events"
import LoadMorePaginator from "@/components/generics/LoadMorePaginator"
import { useIsFirstMount } from "@/hooks/useIsFirstMount"
import AlphabetFilter from "@/components/generics/AlphabetFilter"
import DynamicTabs from "@/components/generics/DynamicTabs"
import { IconBySection } from "@/components/generics/IconBySection"
import { PermissionKeys } from "@/interfaces/permissions"
import { BROWSER_EVENTS } from "@/constants/app"
import { Badge } from "@/components/ui/badge"
import useInfiniteListQuery from "@/hooks/useInfiniteListQuery"
import { EmptySection } from "@/components/generics/EmptySection"
import { IconGallery } from "@/components/Svg/IconGallery"

const GalleryPage = () => {
    const {
        data: sponsoredList,
        isLoading,
        isFetchingNextPage,
        hasNextPage,
        filters,
        updateItems,
        loadMore,
        setSearch,
        setFilter
    } = useInfiniteListQuery<ISponsored, GalleryFilters>({
        endpoint: API_ROUTES.SPONSORED.GALLERY,
        defaultFilters: { vendorRole: 'unity', letter: '' },
    })

    const isFirstMount = useIsFirstMount()

    const handleListUpdate = useCallback((event: BrowserEvent<{ action: 'updated' | 'deleted', data: ISponsored }>) => {
        if (event.detail.action === 'updated') {
            updateItems(sponsoredList.map(sponsored => sponsored.id === event.detail.data.id ? { ...sponsored, ...event.detail.data } : sponsored))
        }
        if (event.detail.action === 'deleted') {
            updateItems(sponsoredList.filter(sponsored => sponsored.id !== event.detail.data.id))
        }
    }, [sponsoredList])

    useEffect(() => {
        subscribeEvent(BROWSER_EVENTS.GALLERY_LIST_UPDATED, handleListUpdate as EventListener)

        return () => {
            unsubscribeEvent(BROWSER_EVENTS.GALLERY_LIST_UPDATED, handleListUpdate as EventListener)
        }
    }, [handleListUpdate])

    return (
        <div className="grid pt-2">
            <div className="flex flex-col gap-4">
                <div className="flex justify-between gap-x-4 ">
                    <DynamicTabs
                        items={[
                            { value: "unity", label: "Unidad", icon: <IconBySection sectionKey={PermissionKeys.POSTS_UNITY} /> },
                            { value: "directors", label: "Directoras", icon: <IconBySection sectionKey={PermissionKeys.POSTS_DIRECTORS} /> },
                        ]}
                        value={filters.vendorRole}
                        onValueChange={value => setFilter({ vendorRole: value as VendorFilterType })}
                    />
                    <div className="flex-1">
                        <SearchInput
                            placeholder="Buscar por nombre/cuenta"
                            onSubmitSearch={setSearch}
                        />
                    </div>
                </div>
                <AlphabetFilter onFilter={letter => setFilter({ letter })} />
            </div>
            {isLoading && !isFirstMount ? (
                <PageLoader />
            ) : (
                <div className="grid mt-10 gap-x-5 gap-y-14 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {sponsoredList.map(sponsored => (
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
            {sponsoredList.length === 0 && !isLoading && (
                <EmptySection
                    title="No hay resultados"
                    description="Intenta ajustar los filtros o buscar con otras palabras clave."
                    media={<IconGallery />}
                />
            )}
            {hasNextPage &&
                <LoadMorePaginator disabled={!hasNextPage} loading={isFetchingNextPage} onLoadMore={() => loadMore()} />
            }
        </div>
    )
}

export default GalleryPage
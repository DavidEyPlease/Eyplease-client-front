import PageLoader from "@/components/generics/PageLoader"
import { API_ROUTES } from "@/constants/api"
import PostItem from "./components/PostItem"
import FilterPosts from "./components/FilterPosts"
import { useCallback, useEffect } from "react"
import clsx from "clsx"
import { BROWSER_EVENTS, MAP_MAIN_POSTS_SECTIONS } from "@/constants/app"
import { IPost, IPostsFilters, MainPostSectionTypes, PostSectionTypes } from "@/interfaces/posts"
import PageTitle from "@/components/generics/PageTitle"
import PostsStats from "./components/Stats"
import { BrowserEvent, subscribeEvent, unsubscribeEvent } from "@/utils/events"
import { EmptySection } from "@/components/generics/EmptySection"
import { IconPosts } from "@/components/Svg/IconPosts"
import useInfiniteListQuery from "@/hooks/useInfiniteListQuery"
import LoadMorePaginator from "@/components/generics/LoadMorePaginator"

const PostsPage = () => {
    const {
        data: posts,
        isLoading,
        isFetchingNextPage,
        hasNextPage,
        filters,
        updateItems,
        loadMore,
        setFilter
    } = useInfiniteListQuery<IPost, IPostsFilters>({
        endpoint: API_ROUTES.POSTS.LIST,
        defaultFilters: {
            mainSection: MainPostSectionTypes.UNITY,
            section: PostSectionTypes.BIRTHDAYS
        },
    })

    // const handleScroll = () => {
    //     if (window.scrollY > 200) {
    //         setScrolling(true)
    //     } else {
    //         setScrolling(false)
    //     }
    // }

    const handleListUpdate = useCallback((event: BrowserEvent<{ action: 'updated', data: IPost }>) => {
        if (event.detail.action === 'updated') {
            updateItems(posts.map(post => post.id === event.detail.data.id ? { ...post, ...event.detail.data } : post))
        }
    }, [posts])

    useEffect(() => {
        subscribeEvent(BROWSER_EVENTS.POSTS_LIST_UPDATED, handleListUpdate as EventListener)

        return () => {
            unsubscribeEvent(BROWSER_EVENTS.POSTS_LIST_UPDATED, handleListUpdate as EventListener)
        }
    }, [handleListUpdate])

    // useEffect(() => {
    //     window.addEventListener('scroll', handleScroll)
    //     return () => {
    //         window.removeEventListener('scroll', handleScroll)
    //     }
    // }, [])

    return (
        <div className="grid space-y-5">
            <div className="flex gap-x-5">
                <div className="flex-1">
                    <PageTitle>
                        <h1 className="text-3xl font-semibold">
                            Seguimiento de {MAP_MAIN_POSTS_SECTIONS[filters.mainSection as MainPostSectionTypes]}
                        </h1>
                        <p>Esté al tanto de las últimas publicaciones del equipo de su {MAP_MAIN_POSTS_SECTIONS[filters.mainSection as MainPostSectionTypes]}</p>
                    </PageTitle>
                </div>
                <PostsStats />
            </div>

            <div className={clsx(/*scrolling && 'p-2 shadow-sm bg-card rounded-sm',"sticky transition-all duration-150 top-0 z-10*/ "w-full")}>
                <FilterPosts
                    mainSection={filters.mainSection as MainPostSectionTypes}
                    activeFilters={filters}
                    setMainSection={(mainSection) => setFilter({ mainSection })}
                    setPostSection={(section) => setFilter({ section })}
                />
            </div>

            {isLoading ? (
                <PageLoader />
            ) : (
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 md:grid-cols-3 2xl:grid-cols-4">
                    {posts.map((post) => (
                        <PostItem key={post.id} item={post} />
                    ))}
                </div>
            )}
            {posts.length === 0 && !isLoading && (
                <EmptySection
                    title="No hay resultados"
                    description="Intenta ajustar los filtros o buscar con otras palabras clave."
                    media={<IconPosts />}
                />
            )}
            {hasNextPage &&
                <LoadMorePaginator loading={isFetchingNextPage} onLoadMore={() => loadMore()} />
            }
        </div>
    )
}

export default PostsPage
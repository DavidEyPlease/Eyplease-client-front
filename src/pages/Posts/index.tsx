import PageLoader from "@/components/generics/PageLoader"
import { API_ROUTES } from "@/constants/api"
import PostItem from "./components/PostItem"
import FilterPosts from "./components/FilterPosts"
import { MAP_MAIN_POSTS_SECTIONS } from "@/constants/app"
import { IPost, IPostsFilters, MainPostSectionTypes, PostSectionTypes } from "@/interfaces/posts"
import PageTitle from "@/components/generics/PageTitle"
import PostsStats from "./components/Stats"
import { EmptySection } from "@/components/generics/EmptySection"
import { IconPosts } from "@/components/Svg/IconPosts"
import useInfiniteListQuery from "@/hooks/useInfiniteListQuery"
import LoadMorePaginator from "@/components/generics/LoadMorePaginator"
import { usePostsStore } from "@/store/posts"

const DEFAULT_POST_SECTION = {
    [MainPostSectionTypes.CLIENTS]: PostSectionTypes.CUSTOMER_BIRTHDAYS,
    [MainPostSectionTypes.DIRECTORS]: PostSectionTypes.NATIONAL_BIRTHDAYS,
    [MainPostSectionTypes.UNITY]: PostSectionTypes.BIRTHDAYS,
}

const PostsPage = () => {
    const { filters, setFilters, getListQueryKey } = usePostsStore(state => state)

    const listQueryKey = getListQueryKey()

    const {
        data,
        isFetchingNextPage,
        isLoading,
        hasNextPage,
        fetchNextPage,
    } = useInfiniteListQuery<IPost, IPostsFilters>(
        API_ROUTES.POSTS.LIST,
        {
            queryParams: filters,
            customQueryKey: listQueryKey,
            enabled: true,
            staleTime: 5000
        }
    )

    return (
        <div className="space-y-5">
            <div className="grid md:grid-cols-6 gap-4">
                <PageTitle className="md:col-span-4">
                    <h1 className="text-xl md:text-3xl font-semibold">
                        Seguimiento de {MAP_MAIN_POSTS_SECTIONS[filters.post_type as MainPostSectionTypes]}
                    </h1>
                    <p className="text-sm md:text-base">Esté al tanto de las últimas publicaciones del equipo de su {MAP_MAIN_POSTS_SECTIONS[filters.post_type as MainPostSectionTypes]}</p>
                </PageTitle>
                <div className="md:col-span-2">
                    <PostsStats />
                </div>
            </div>

            <FilterPosts
                mainSection={filters.post_type as MainPostSectionTypes}
                activeFilters={filters}
                setMainSection={(mainSection) => setFilters({ post_type: mainSection, section: DEFAULT_POST_SECTION[mainSection] })}
                setPostSection={(section) => setFilters({ section })}
            />

            {isLoading ? (
                <PageLoader />
            ) : (
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-3 xl:grid-cols-4">
                    {(data?.pages.flatMap(page => page.items) ?? []).map((post) => (
                        <PostItem key={post.id} item={post} />
                    ))}
                </div>
            )}
            {(data?.pages.flatMap(page => page.items) ?? []).length === 0 && !isLoading && (
                <EmptySection
                    title="No hay resultados"
                    description="Intenta ajustar los filtros o buscar con otras palabras clave."
                    media={<IconPosts />}
                />
            )}
            {hasNextPage &&
                <LoadMorePaginator loading={isFetchingNextPage} onLoadMore={() => fetchNextPage()} />
            }
        </div>
    )
}

export default PostsPage
import { API_ROUTES } from "@/constants/api"
import useRequestQuery from "@/hooks/useRequestQuery"
import { PaginationResponse } from "@/interfaces/common"
import { ISponsored } from "@/interfaces/sponsored"
import { useGalleryStore } from "@/store/gallery"
import { InfiniteData, useQueryClient } from "@tanstack/react-query"
import { useState } from "react"

const useSponsoredActions = () => {
    const { getListQueryKey } = useGalleryStore(state => state)
    const [actionLoading, setActionLoading] = useState<'remove' | 'update' | null>(null)
    const { request } = useRequestQuery()
    const queryClient = useQueryClient()

    const listQueryKey = getListQueryKey()

    const updateCachedVendor = (itemId: string, data?: Partial<ISponsored>) => {
        queryClient.setQueryData<InfiniteData<PaginationResponse<ISponsored>>>(listQueryKey, (current) => {
            if (!current) return current

            const pages = current.pages.map((page) => {
                const items = data
                    ? page.items.map((item) => item.id === itemId ? { ...item, ...data } : item)
                    : page.items.filter((item) => item.id !== itemId)

                return { ...page, items }
            })

            return { ...current, pages }
        })
    }

    const onRemoveVendor = async (sponsoredId: string) => {
        try {
            setActionLoading('remove')
            const response = await request('DELETE', API_ROUTES.SPONSORSHIP.REMOVE.replace('{id}', sponsoredId))
            if (response.success) {
                updateCachedVendor(sponsoredId)
            }
        } catch (error) {
            console.error(error)
        } finally {
            setActionLoading(null)
        }
    }

    const onDisplayVendor = async (sponsored: ISponsored) => {
        try {
            setActionLoading('update')
            const v = !sponsored.display_in_reports
            const response = await request<{ display_in_reports: boolean }, ISponsored>('PATCH', API_ROUTES.SPONSORSHIP.UPDATE.replace('{id}', sponsored.id), { display_in_reports: v })
            if (response.success) {
                // toast.success('Datos actualizados correctamente')
                updateCachedVendor(sponsored.id, { display_in_reports: response.data.display_in_reports })
            }
        } catch (error) {
            console.error(error)
        } finally {
            setActionLoading(null)
        }
    }

    return {
        actionLoading,
        updateCachedVendor,
        onRemoveVendor,
        onDisplayVendor
    }
}

export default useSponsoredActions
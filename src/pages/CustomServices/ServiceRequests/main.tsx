
import { CursorPaginationResponse } from "@/interfaces/common"
import { API_ROUTES } from "@/constants/api"
import { UserRequestService } from "@/interfaces/requestService"
import useListQuery from "@/hooks/useListQuery"
import { queryKeys } from "@/utils/cache"

import { IconPlus } from "@/components/Svg/IconPlus"
import PageLoader from "@/components/generics/PageLoader"
import CustomServiceItem from "./components/Item"
import FabButton from "@/components/generics/FabButton"
import SearchInput from "@/components/generics/SearchInput"
import Modal from "@/components/common/Modal"
import CustomServiceForm from "./components/Form"
import { EmptySection } from "@/components/generics/EmptySection"
import { IconServices } from "@/components/Svg/IconServices"
import { useRequestServicesStore } from "@/store/request-services"
import SetServiceImages from "./components/SetImages"
import ModalDetail, { SummaryDetails } from "./components/Detail"

const ServiceRequests = () => {
    const { selectedItem, openAction, setOpenAction, setSelectedItem } = useRequestServicesStore(state => state)

    const {
        response: services,
        isLoading,
        setSearch
    } = useListQuery<CursorPaginationResponse<UserRequestService>>({
        endpoint: API_ROUTES.CUSTOM_SERVICES.GET_REQUEST_SERVICES,
        defaultPerPage: 10,
        customQueryKey: (params) => queryKeys.list(`services`, params)
    })

    return (
        <div className="grid pt-2 gap-y-4">
            {isLoading ? (
                <PageLoader />
            ) : (
                <>
                    <SearchInput
                        placeholder="Buscar por titulo"
                        onSubmitSearch={setSearch}
                    />
                    <div className="grid md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-4">
                        {(services?.data?.items || []).map(item => (
                            <CustomServiceItem key={item.id} item={item} />
                        ))}
                    </div>
                </>
            )}

            {(services?.data?.items || []).length === 0 && !isLoading && (
                <EmptySection
                    title="No hay nada que mostrar"
                    description="Parece que aún no has creado ningún servicio personalizado."
                    media={<IconServices />}
                />
            )}

            <FabButton
                icon={<IconPlus />}
                text="Nuevo servicio"
                onClick={() => setOpenAction('create')}
            />

            <Modal
                open={openAction === 'create'}
                onOpenChange={() => setOpenAction('none')}
                title="Nuevo servicio"
                size="lg"
            >
                <CustomServiceForm onHandleSuccess={() => setOpenAction('uploadFiles')} />
            </Modal>

            <Modal
                open={openAction === 'uploadFiles' && !!selectedItem}
                onOpenChange={() => setOpenAction('none')}
                title={`Agregar archivos adicionales a servicio: ${selectedItem?.title || ''}`}
                size="xxl"
            >
                {selectedItem && (
                    <>
                        <SummaryDetails item={selectedItem} />
                        <SetServiceImages />
                    </>
                )}
            </Modal>

            {!!selectedItem && openAction === 'view' && (
                <ModalDetail
                    item={selectedItem}
                    open={!!selectedItem && openAction === 'view'}
                    onOpenChange={() => {
                        setSelectedItem(null)
                        setOpenAction('none')
                    }}
                />
            )}
        </div>
    )
}

export default ServiceRequests
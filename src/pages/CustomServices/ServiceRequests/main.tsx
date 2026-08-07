import { useEffect, useMemo, useState } from "react"
import { InboxIcon, PlusIcon } from "lucide-react"

import Button from "@/components/common/Button"
import Modal from "@/components/common/Modal"
import { EmptySection } from "@/components/generics/EmptySection"
import FilterChip from "@/components/generics/FilterChip"
import PageLoader from "@/components/generics/PageLoader"
import SearchInput from "@/components/generics/SearchInput"
import { IconServices } from "@/components/Svg/IconServices"
import { API_ROUTES } from "@/constants/api"
import { MAP_USER_REQUEST_STATUS } from "@/constants/app"
import useListQuery from "@/hooks/useListQuery"
import { CursorPaginationResponse } from "@/interfaces/common"
import { UserRequestService, UserRequestStatusTypes } from "@/interfaces/requestService"
import { cn } from "@/lib/utils"
import { useRequestServicesStore } from "@/store/request-services"
import { queryKeys } from "@/utils/cache"
import ServiceMeta from "../components/ServiceMeta"
import ServiceWorkspace from "../components/ServiceWorkspace"
import { STATUS_FILTER_ORDER } from "../utils"
import CustomServiceForm from "./components/Form"
import CustomServiceItem from "./components/Item"
import SetServiceImages from "./components/SetImages"
import ServiceStatusBadge from "./components/StatusBadge"

const ALL_STATUSES = 'all'

const ServiceRequests = () => {
    const { selectedItem, openAction, setOpenAction, setSelectedItem } = useRequestServicesStore(state => state)
    const [statusFilter, setStatusFilter] = useState<UserRequestStatusTypes | typeof ALL_STATUSES>(ALL_STATUSES)

    const {
        response: services,
        isLoading,
        setSearch
    } = useListQuery<CursorPaginationResponse<UserRequestService>>({
        endpoint: API_ROUTES.CUSTOM_SERVICES.GET_REQUEST_SERVICES,
        defaultPerPage: 10,
        customQueryKey: (params) => queryKeys.list(`services`, params)
    })

    const items = useMemo(() => services?.data?.items ?? [], [services?.data?.items])

    const filteredItems = useMemo(
        () => statusFilter === ALL_STATUSES ? items : items.filter(item => item.status === statusFilter),
        [items, statusFilter]
    )

    /* Mantiene la selección apuntando a la referencia fresca de la lista (refetch, filtros, borrados).
       No se toca mientras hay un modal abierto: el flujo crear → subir archivos depende de selectedItem. */
    useEffect(() => {
        if (openAction !== 'none') return
        const fresh = filteredItems.find(item => item.id === selectedItem?.id) ?? filteredItems[0] ?? null
        if (fresh !== selectedItem) setSelectedItem(fresh)
    }, [filteredItems, selectedItem, openAction, setSelectedItem])

    return (
        <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-3 rounded-3xl border bg-card bg-hero-glow px-5 py-4 shadow-card">
                <div className="flex flex-col items-stretch gap-3 md:flex-row md:items-center">
                    <div className="min-w-60 flex-1">
                        <SearchInput
                            placeholder="Buscar por título…"
                            onSubmitSearch={setSearch}
                        />
                    </div>
                    <Button
                        text={<><PlusIcon className="size-4" />Nuevo servicio</>}
                        rounded
                        onClick={() => setOpenAction('create')}
                    />
                </div>

                <div className="flex flex-wrap gap-2">
                    <FilterChip
                        label="Todas"
                        active={statusFilter === ALL_STATUSES}
                        onClick={() => setStatusFilter(ALL_STATUSES)}
                    />
                    {STATUS_FILTER_ORDER.map(status => (
                        <FilterChip
                            key={status}
                            label={MAP_USER_REQUEST_STATUS[status].label}
                            icon={<span className={cn('size-2 rounded-full', MAP_USER_REQUEST_STATUS[status].bgBorder)} />}
                            active={statusFilter === status}
                            onClick={() => setStatusFilter(status)}
                        />
                    ))}
                </div>
            </div>

            {isLoading && (
                <div className="relative grid min-h-64 place-content-center">
                    <PageLoader />
                </div>
            )}

            {!isLoading && items.length === 0 && (
                <EmptySection
                    title="No hay nada que mostrar"
                    description="Parece que aún no has creado ningún servicio personalizado."
                    media={<IconServices />}
                />
            )}

            {!isLoading && items.length > 0 && (
                <div className="grid items-start gap-4 lg:grid-cols-[minmax(0,1fr)_460px]">
                    <ul className="overflow-hidden rounded-3xl border bg-card shadow-card">
                        {filteredItems.map(item => (
                            <CustomServiceItem
                                key={item.id}
                                item={item}
                                active={item.id === selectedItem?.id}
                                onSelect={() => setSelectedItem(item)}
                            />
                        ))}
                        {filteredItems.length === 0 && (
                            <li className="flex flex-col items-center gap-2 px-6 py-10 text-center">
                                <InboxIcon className="size-6 text-muted-foreground/50" aria-hidden />
                                <p className="text-sm font-semibold text-muted-foreground">No hay solicitudes con este estado.</p>
                            </li>
                        )}
                    </ul>

                    {/* El envoltorio se estira a la altura de la fila: le da recorrido al sticky del workspace */}
                    <div className="lg:self-stretch">
                        <div className="rounded-3xl border bg-card p-4 shadow-card lg:sticky lg:top-4">
                            {selectedItem ? (
                                <ServiceWorkspace
                                    item={selectedItem}
                                    onEdit={() => setOpenAction('edit')}
                                    onDeleted={() => setSelectedItem(null)}
                                />
                            ) : (
                                <p className="py-10 text-center text-sm font-semibold text-muted-foreground">
                                    Selecciona una solicitud para ver su expediente.
                                </p>
                            )}
                        </div>
                    </div>
                </div>
            )}

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
                    <div className="flex flex-col gap-4">
                        <div className="flex items-start justify-between gap-3">
                            <ServiceMeta item={selectedItem} />
                            <ServiceStatusBadge status={selectedItem.status} />
                        </div>
                        <SetServiceImages />
                    </div>
                )}
            </Modal>

            <Modal
                open={openAction === 'edit' && !!selectedItem}
                onOpenChange={() => setOpenAction('none')}
                title={`Editar servicio: ${selectedItem?.title || ''}`}
                size="lg"
            >
                {selectedItem && openAction === 'edit' && (
                    <CustomServiceForm
                        item={selectedItem}
                        onHandleSuccess={() => setOpenAction('none')}
                    />
                )}
            </Modal>
        </div>
    )
}

export default ServiceRequests

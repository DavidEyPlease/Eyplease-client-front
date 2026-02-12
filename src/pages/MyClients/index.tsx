import Button from "@/components/common/Button"
import SearchInput from "@/components/generics/SearchInput"
import { IconPlus } from "@/components/Svg/IconPlus"
// import AVATAR_IMG from '@/assets/images/user-avatar.avif'
import CustomerItem from "./components/Item"
import PageLoader from "@/components/generics/PageLoader"
import LoadMorePaginator from "@/components/generics/LoadMorePaginator"
import AlphabetFilter from "@/components/generics/AlphabetFilter"
import Modal from "@/components/common/Modal"
import { useState } from "react"
import CustomerByClientForm from "./components/Form"
import CustomerEdit from "./components/ClientEdit"
import useListMyClients from "./useListMyClients"
import DateContainer from "@/components/generics/DateContainer"
import { EmptySection } from "@/components/generics/EmptySection"
import { IconMyClients } from "@/components/Svg/IconMyClients"

const MyClientsPage = () => {
    const [openForm, setOpenForm] = useState(false)

    const {
        clients,
        isLoading,
        hasNextPage,
        isFetchingNextPage,
        fetchNextPage,
        setFilters
    } = useListMyClients()

    return (
        <div className="grid pt-2 gap-y-2">
            <div className="flex justify-between mb-2 gap-x-4">
                <div className="flex-1">
                    <SearchInput
                        placeholder="Buscar por nombre"
                        onSubmitSearch={(e) => setFilters({ search: e })}
                    />
                </div>
                <Button
                    text={
                        <>
                            <IconPlus />
                            <span>Añadir nuevo</span>
                        </>
                    }
                    rounded
                    onClick={() => setOpenForm(true)}
                />
            </div>
            <AlphabetFilter onFilter={letter => setFilters({ letter })} />
            {isLoading && !isFetchingNextPage ? (
                <PageLoader />
            ) : (
                <div className="grid mt-10 gap-x-5 gap-y-14 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {clients.map(client => (
                        <CustomerItem
                            key={client.id}
                            item={client}
                            cardBody={
                                <div className="text-center space-y-2">
                                    <p className='text-base'>{client.name}</p>
                                    {/* <DateContainer
                                        date={client.created_at}
                                        label="F. Nac."
                                    /> */}
                                    <DateContainer
                                        date={client.created_at}
                                        label="Desde"
                                    />
                                    <CustomerEdit item={client} />
                                </div>
                            }
                        />
                    ))}
                </div>
            )}
            {clients.length === 0 && !isLoading && (
                <EmptySection
                    title="No hay resultados"
                    description="Intenta ajustar los filtros o buscar con otras palabras clave."
                    media={<IconMyClients />}
                />
            )}
            {hasNextPage &&
                <LoadMorePaginator disabled={!hasNextPage} loading={isFetchingNextPage} onLoadMore={() => fetchNextPage()} />
            }

            <Modal open={openForm} onOpenChange={setOpenForm} title="Crear Nuevo Cliente">
                <CustomerByClientForm onSuccess={() => setOpenForm(false)} />
            </Modal>
        </div>
    )
}

export default MyClientsPage
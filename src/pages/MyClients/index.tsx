import { useEffect, useState } from "react"

import Button from "@/components/common/Button"
import SearchInput from "@/components/generics/SearchInput"
import { IconPlus } from "@/components/Svg/IconPlus"
import CustomerItem from "./components/Item"
import PageLoader from "@/components/generics/PageLoader"
import LoadMorePaginator from "@/components/generics/LoadMorePaginator"
import AlphabetFilter from "@/components/generics/AlphabetFilter"
import Modal from "@/components/common/Modal"
import CustomerByClientForm from "./components/Form"
import useListMyClients from "./useListMyClients"
import { EmptySection } from "@/components/generics/EmptySection"
import { IconMyClients } from "@/components/Svg/IconMyClients"
import { Badge } from "@/components/ui/badge"

const MyClientsPage = () => {
    const [openForm, setOpenForm] = useState(false)

    const {
        clients,
        data,
        isLoading,
        hasNextPage,
        isFetchingNextPage,
        fetchNextPage,
        setFilters
    } = useListMyClients()

    const total = data?.pages[0]?.total_items

    // Mientras se refilra, la query se vacía un instante: se retiene el último total para que el chip no parpadee
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
                            placeholder="Buscar por nombre…"
                            onSubmitSearch={(e) => setFilters({ search: e })}
                        />
                    </div>
                    {displayTotal !== null && (
                        <Badge
                            variant="outline"
                            className="rounded-full border-primary/20 bg-primary/[0.07] px-3.5 py-1.5 text-[13px] font-bold text-primary"
                        >
                            {displayTotal} {displayTotal === 1 ? 'cliente' : 'clientes'}
                        </Badge>
                    )}
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
            </div>

            {isLoading && !isFetchingNextPage ? (
                <div className="relative grid min-h-64 place-content-center">
                    <PageLoader />
                </div>
            ) : (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {clients.map(client => (
                        <CustomerItem key={client.id} item={client} />
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

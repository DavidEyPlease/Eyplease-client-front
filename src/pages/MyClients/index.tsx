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
import PageHead from '@/layouts/TopShell/PageHead'
import { CustomerOfClient } from "@/interfaces/customerOfClients"
import useStrategyEntry from '@/pages/Estrategia/feature'
import CustomerSalesDialog from '@/pages/Estrategia/components/CustomerSalesDialog'
import SaleDialog from '@/pages/Estrategia/components/SaleDialog'

const MyClientsPage = () => {
    const [openForm, setOpenForm] = useState(false)
    // «Tu estrategia»: lo que le ha comprado cada clienta y «Ya me compró» (detrás de su interruptor)
    const strategy = useStrategyEntry()
    const [purchasesOf, setPurchasesOf] = useState<CustomerOfClient | null>(null)
    const [selling, setSelling] = useState(false)

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
            <PageHead eyebrow="Mi negocio" title={<>Mis <em>clientas</em></>} sub="Regístralas con su cumpleaños y su pieza de felicitación llega sola el día que toca." />
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
                    {strategy && (
                        <button type="button" onClick={() => setSelling(true)} className="h-11 cursor-pointer rounded-full border border-[#6C47FF]/35 px-5 text-[14px] font-bold text-[#4E31C0] hover:bg-[#6C47FF]/5 dark:text-[#BBAAFF]">
                            Ya me compró
                        </button>
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
                        <CustomerItem key={client.id} item={client} onPurchases={strategy ? () => setPurchasesOf(client) : undefined} />
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

            {strategy && (
                <>
                    <CustomerSalesDialog customer={purchasesOf} onClose={() => setPurchasesOf(null)} />
                    <SaleDialog open={selling} onClose={() => setSelling(false)} />
                </>
            )}

            <Modal open={openForm} onOpenChange={setOpenForm} title="Crear Nuevo Cliente">
                <CustomerByClientForm onSuccess={() => setOpenForm(false)} />
            </Modal>
        </div>
    )
}

export default MyClientsPage

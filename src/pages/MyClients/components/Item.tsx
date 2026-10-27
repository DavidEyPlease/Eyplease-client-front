import { Card } from "@/components/ui/card"
import DateContainer from "@/components/generics/DateContainer"
import { CustomerOfClient } from "@/interfaces/customerOfClients"
import CustomerEdit from "./ClientEdit"
import Photo from "./Photo"

interface Props {
    item: CustomerOfClient
    /** Con «Tu estrategia»: abre lo que le ha comprado */
    onPurchases?: () => void
}

const CustomerItem = ({ item, onPurchases }: Props) => {
    return (
        <Card className="flex flex-col items-center gap-2.5 rounded-[20px] px-4 pt-6 pb-5 shadow-card transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/15 hover:shadow-card-hover">
            {/* Halo en el wrapper: Avatar aplica sizeClasses al contenedor y a la imagen, un ring ahí se duplica */}
            <div className="rounded-full bg-card p-1 ring-1 ring-border">
                <Photo
                    itemId={item.id}
                    src={item.photo?.url}
                    uri={item?.photo?.uri || null}
                    alt={item.name}
                    sizeClasses="size-24"
                />
            </div>

            <p className="text-center text-sm font-bold leading-snug tracking-tight">{item.name}</p>

            <DateContainer date={item.created_at} label="Desde" />

            {onPurchases && (
                <button type="button" onClick={onPurchases} className="h-9 cursor-pointer rounded-full bg-[#6C47FF]/10 px-4 text-[12.5px] font-bold text-[#4E31C0] transition-colors hover:bg-[#6C47FF]/20 dark:text-[#BBAAFF]">
                    Sus compras
                </button>
            )}

            <CustomerEdit item={item} />
        </Card>
    )
}

export default CustomerItem

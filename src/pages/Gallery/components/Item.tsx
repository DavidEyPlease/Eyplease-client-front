import { EyeOffIcon } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { ISponsored } from "@/interfaces/sponsored"
import SponsoredPhoto from "./SponsoredPhoto"
import VendorEdit from "./VendorEdit"

interface Props {
    item: ISponsored
}

const VendorItem = ({ item }: Props) => {
    return (
        <Card className="relative flex flex-col items-center gap-2.5 rounded-[20px] px-4 pt-7 pb-5 shadow-card transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/15 hover:shadow-card-hover">
            <VendorEdit sponsored={item} />

            {/* Halo en el wrapper: Avatar aplica sizeClasses al contenedor y a la imagen, un ring ahí se duplica */}
            <div className="rounded-full bg-card p-1 ring-1 ring-border">
                <SponsoredPhoto
                    itemId={item.id}
                    itemAccount={item.account}
                    src={item.photo?.url}
                    uri={item?.photo?.uri || null}
                    alt={item.name}
                    sizeClasses="size-24"
                />
            </div>

            <p className="text-center text-sm font-bold leading-snug tracking-tight">{item.name}</p>

            <div className="flex flex-col items-center gap-1.5">
                <Badge
                    variant="outline"
                    className="rounded-full border-primary/20 bg-primary/[0.07] px-3 py-0.5 text-[12.5px] font-bold tracking-[0.06em] text-primary"
                >
                    {item.account}
                </Badge>
                {!item.display_in_reports && (
                    <Badge
                        variant="outline"
                        className="rounded-full border-border bg-surface-soft px-2.5 py-0.5 text-[11px] font-bold text-muted-foreground"
                    >
                        <EyeOffIcon />
                        Oculta en reportes
                    </Badge>
                )}
            </div>
        </Card>
    )
}

export default VendorItem

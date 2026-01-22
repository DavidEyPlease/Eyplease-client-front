import { Card, CardContent } from "@/components/ui/card"
import { ISponsored } from "@/interfaces/sponsored"
import SponsoredPhoto from "./SponsoredPhoto"

interface Props {
    item: ISponsored
    cardBody: React.ReactNode
}

const VendorItem = ({ item, cardBody }: Props) => {
    return (
        <Card className='overflow-visible shadow-md'>
            <CardContent>
                <div className='relative flex justify-center -mt-10 mb-5'>
                    <SponsoredPhoto
                        itemId={item.id}
                        itemAccount={item.account}
                        src={item.photo?.url}
                        uri={item?.photo?.uri || null}
                        alt={item.name}
                        sizeClasses="size-20"
                    />
                </div>
                <div className='text-center'>
                    {cardBody}
                </div>
            </CardContent>
        </Card>
    )
}

export default VendorItem
import { Card, CardContent } from "@/components/ui/card"
import Photo from "./Photo"
import { CustomerOfClient } from "@/interfaces/customerOfClients"

interface Props {
    item: CustomerOfClient
    cardBody: React.ReactNode
}

const CustomerItem = ({ item, cardBody }: Props) => {
    return (
        <Card className='overflow-visible shadow-md'>
            <CardContent className="pt-0">
                <div className='relative flex justify-center -mt-10 mb-5'>
                    <Photo
                        itemId={item.id}
                        src={item.photo?.url}
                        uri={item?.photo?.uri || null}
                        alt={item.name}
                        sizeClasses="size-24"
                    />
                </div>
                <div className='text-center'>
                    {cardBody}
                </div>
            </CardContent>
        </Card>
    )
}

export default CustomerItem
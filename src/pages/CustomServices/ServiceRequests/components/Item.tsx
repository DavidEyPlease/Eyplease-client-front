import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import ServiceStatusBadge from "./StatusBadge"
import DateContainer from "@/components/generics/DateContainer"
import ServiceActions from "./Actions"
import { UserRequestService } from "@/interfaces/requestService"

interface Props {
    item: UserRequestService
}

const CustomServiceItem = ({ item }: Props) => {
    return (
        <Card
            className="flex flex-col py-4 gap-2"
        >
            <CardHeader>
                <CardTitle className="text-sm line-clamp-1">{item.title}</CardTitle>
            </CardHeader>
            <CardContent className="flex-1 space-y-1">
                <Badge variant="outline">{item.category}</Badge>
                {item.description &&
                    <p className="text-sm text-muted-foreground line-clamp-3">
                        {item.description.substring(0, 100)}...
                    </p>
                }
                <DateContainer date={item.delivery_date} label="Entrega:" format={{ date: 'medium' }} />
            </CardContent>
            <CardFooter className="flex justify-between pt-3 flex-wrap">
                <ServiceStatusBadge status={item.status} />
                <ServiceActions item={item} />
            </CardFooter>
        </Card>
    )
}

export default CustomServiceItem
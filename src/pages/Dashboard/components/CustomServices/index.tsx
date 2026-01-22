import Spinner from "@/components/common/Spinner"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CustomServicesSummaryTypes } from "../../types"
import { MAP_STATUS_USER_REQUEST_SERVICES } from "@/constants/app"

interface Props {
    loading: boolean
    summary: CustomServicesSummaryTypes
}

const CustomServicesSummary = ({ loading, summary }: Props) => {
    return (
        <Card className="grid aspect-video rounded-xl">
            <CardHeader>
                <CardTitle>Servicios</CardTitle>
            </CardHeader>

            <CardContent>
                {loading ? (
                    <Spinner color="primary" />
                ) : (
                    summary.map(({ status, total }) => (
                        <p className="text-muted-foreground">Tienes <b>{total}</b> en {MAP_STATUS_USER_REQUEST_SERVICES[status]}</p>
                    ))
                )}
            </CardContent>
        </Card>
    )
}

export default CustomServicesSummary
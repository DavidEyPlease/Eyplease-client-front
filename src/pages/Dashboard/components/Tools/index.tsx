import Spinner from "@/components/common/Spinner"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ToolsSummaryType } from "../../types"
import { APP_ROUTES, MAP_TOOLS_SECTIONS } from "@/constants/app"
import { IconEye } from "@/components/Svg/IconEye"
import { Button } from "@/components/ui/button"
import { useNavigate } from "react-router"
import { ToolSectionTypes } from "@/interfaces/tools"

interface Props {
    loading: boolean
    summary: ToolsSummaryType
}

const ToolsSummary = ({ loading, summary }: Props) => {
    const navigate = useNavigate()

    const onOpenTools = (section: ToolSectionTypes) => {
        // setFilters({ section });
        navigate(`${APP_ROUTES.TOOLS}?section=${section}`)
    }

    return (
        <Card className="grid aspect-video rounded-xl">
            <CardHeader>
                <CardTitle>Herramientas mas recientes</CardTitle>
            </CardHeader>

            <CardContent>
                {loading ? (
                    <Spinner color="primary" />
                ) : (
                    summary.map(({ section, total }) => (
                        <div className="flex items-center" key={section}>
                            <p className="text-muted-foreground">
                                Tienes <b>{total}</b> {total > 1 ? 'nuevas herramientas' : 'nueva herramienta'} en {MAP_TOOLS_SECTIONS[section]}
                            </p>
                            <Button variant="link" size="icon" className="ml-2" onClick={() => onOpenTools(section)}>
                                <IconEye />
                            </Button>
                        </div>
                    ))
                )}
            </CardContent>
        </Card>
    )
}

export default ToolsSummary
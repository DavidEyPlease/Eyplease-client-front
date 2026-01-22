import Spinner from "@/components/common/Spinner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PostsSummaryType } from "../../types";

interface Props {
    loading: boolean
    summary: PostsSummaryType
}

const PostsSummary = ({ loading, summary }: Props) => {
    return (
        <Card className="grid aspect-video rounded-xl">
            <CardHeader>
                <CardTitle>Publicaciones de las ultimas 24 horas</CardTitle>
            </CardHeader>

            <CardContent>
                {loading ? (
                    <Spinner color="primary" />
                ) : (
                    summary.map(({ section, total }) => (
                        <p className="text-muted-foreground">Tienes <b>{total}</b> {total > 1 ? 'nuevas publicaciones' : 'nueva publicación'} de {section}</p>
                    ))
                )}
            </CardContent>
        </Card>
    )
}

export default PostsSummary;
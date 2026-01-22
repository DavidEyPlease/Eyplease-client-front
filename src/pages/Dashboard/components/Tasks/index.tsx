import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const Tasks = () => {
    return (
        <Card className="grid aspect-video rounded-xl">
            <CardHeader>
                <CardTitle>Lista de tareas</CardTitle>
                <CardDescription>Completa tus tareas</CardDescription>
            </CardHeader>

            <CardContent></CardContent>
        </Card>
    )
}

export default Tasks;
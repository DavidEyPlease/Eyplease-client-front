import useAuthStore from "@/store/auth"
import { Card, CardContent } from "@/components/ui/card"
// import { Progress } from "@/components/ui/progress"

const UserSubscription = () => {
    const { user } = useAuthStore(state => state)
    return (
        <div className="px-3">
            <Card className="text-white border-none bg-primary-dark">
                <CardContent className="">
                    <p className="font-semibold">{user?.plan?.name || 'Sin plan'}</p>
                    {/* <span className="text-xs">Próxima renovación: <span className="text-secondary">12 Nov 2024</span></span> */}
                    {/* <Progress value={33} className="h-2 mt-5" /> */}
                </CardContent>
            </Card>
        </div>
    )
}

export default UserSubscription
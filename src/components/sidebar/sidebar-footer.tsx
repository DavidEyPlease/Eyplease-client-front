import {
    BadgeCheck,
    // Bell,
    ChevronsUpDown,
    // CreditCard,
    LogOut,
    // Sparkles,
} from "lucide-react"



import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

import {
    SidebarFooter as UISidebarFooter,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    // useSidebar,
} from "@/components/ui/sidebar"
import useAuth from "@/hooks/useAuth"
import { useNavigate } from "react-router"
import { APP_ROUTES } from "@/constants/app"
import LoggedUserAvatar from "@/components/generics/LoggedUserAvatar"
// import UpgradePlan from "@/components/generics/UpgradePlan"
import { IAuthUser } from "@/interfaces/auth"

interface Props {
    user: IAuthUser
}

const SidebarFooter = ({ user }: Props) => {
    const { handleLogout } = useAuth()
    // const { state } = useSidebar()
    const navigate = useNavigate()

    return (
        <UISidebarFooter>
            <SidebarMenu>
                {/* {state !== 'collapsed' &&
                    <SidebarMenuItem>
                        <UpgradePlan />
                    </SidebarMenuItem>
                } */}
                <SidebarMenuItem>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <SidebarMenuButton
                                size="lg"
                                className="text-white hover:text-primary data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                            >
                                {user && <LoggedUserAvatar user={user} />}
                                <div className="grid flex-1 text-sm leading-tight text-left">
                                    <span className="font-semibold truncate">
                                        {user?.name}
                                    </span>
                                    <span className="text-xs truncate">
                                        {user?.account}
                                    </span>
                                </div>
                                <ChevronsUpDown className="ml-auto size-4" />
                            </SidebarMenuButton>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent
                            className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
                            side="bottom"
                            align="end"
                            sideOffset={4}
                        >
                            <DropdownMenuLabel className="p-0 font-normal">
                                <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                                    {user && <LoggedUserAvatar user={user} />}
                                    <div className="grid flex-1 text-sm leading-tight text-left">
                                        <span className="font-semibold truncate">
                                            {user?.name}
                                        </span>
                                        <span className="text-xs truncate">
                                            {user?.account}
                                        </span>
                                    </div>
                                </div>
                            </DropdownMenuLabel>
                            {/* <DropdownMenuSeparator />
                            <DropdownMenuGroup>
                                <DropdownMenuItem>
                                    <Sparkles />
                                    Actualizar Plan
                                </DropdownMenuItem>
                            </DropdownMenuGroup> */}
                            <DropdownMenuSeparator />
                            <DropdownMenuGroup>
                                <DropdownMenuItem onClick={() => navigate(APP_ROUTES.HOME.PROFILE)}>
                                    <BadgeCheck />
                                    Perfil
                                </DropdownMenuItem>
                                {/* <DropdownMenuItem>
                                    <CreditCard />
                                    Suscripción
                                </DropdownMenuItem> */}
                                {/* <DropdownMenuItem>
                                    <Bell />
                                    Notificaciones
                                </DropdownMenuItem> */}
                            </DropdownMenuGroup>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={handleLogout}>
                                <LogOut />
                                Cerrar sesión
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </SidebarMenuItem>
            </SidebarMenu>
        </UISidebarFooter>
    )
}

export default SidebarFooter
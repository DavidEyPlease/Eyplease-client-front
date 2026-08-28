import { DropdownMenu } from "@/components/ui/dropdown-menu"
import { Skeleton } from "@/components/ui/skeleton"
import { SidebarHeader as UISidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from "@/components/ui/sidebar"

import EYPLEASE_LOGO_WHITE from "@/assets/images/icon-white.png"
import { IAuthUser } from "@/interfaces/auth"

// import {
//     ChevronsUpDown,
//     Plus,
//     GalleryVerticalEnd,
//     AudioWaveform,
//     Command
// } from "lucide-react"

interface Props {
    /** Sin usuario todavía: la marca se pinta igual y solo se finge la cuenta. */
    user?: IAuthUser | null
}

const SidebarHeader = ({ user }: Props) => {

    return (
        <UISidebarHeader>
            <SidebarMenu>
                <SidebarMenuItem>
                    <DropdownMenu>
                        <SidebarMenuButton
                            size="lg"
                            className="text-white hover:bg-transparent hover:text-white"
                        >
                            <div className="flex items-center justify-center aspect-square size-12">
                                <img src={EYPLEASE_LOGO_WHITE} />
                            </div>
                            <div className="grid flex-1 text-lg leading-tight text-left">
                                <span className="font-semibold truncate">
                                    Eyplease
                                </span>
                                {user
                                    ? <span className="text-sm truncate">{user.account}</span>
                                    : <Skeleton className="w-24 h-3.5 mt-1 bg-white/15" />
                                }
                            </div>
                        </SidebarMenuButton>
                    </DropdownMenu>
                </SidebarMenuItem>
            </SidebarMenu>
        </UISidebarHeader>
    )
}

export default SidebarHeader
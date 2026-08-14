// import ButtonBack from "@/components/generics/ButtonBack";
import AssistantLauncher from "@/components/assistant/AssistantLauncher"
import { DarkModeSelector } from "@/components/common/DarkModeSelector"
import { APP_ROUTES, SIDEBAR_ITEMS } from "@/constants/app"
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb"
import { Separator } from "@/components/ui/separator"
import { SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"
import { NotificationsDropdown } from "../generics/Notifications"

interface Props {
    children: React.ReactNode;
    page: string;
}

const MainContainer = ({ children, page }: Props) => {
    const labelPage = SIDEBAR_ITEMS.find(item => page.includes(item.path))?.label
    return (
        <SidebarInset className="p-[10px]">
            <div className="h-full shadow-[0px_20px_20px_10px_#00000024] rounded-2xl">
                <header className="flex h-16 shrink-0 items-center transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12 gap-2 px-4 w-full">
                    <div className="flex flex-1 items-center gap-2">
                        <SidebarTrigger className="-ml-1" />
                        <Separator
                            orientation="vertical"
                            className="mr-2 data-[orientation=vertical]:h-4"
                        />
                        <Breadcrumb>
                            <BreadcrumbList>
                                {/* <BreadcrumbItem>
                                <ButtonBack />
                            </BreadcrumbItem> */}
                                <BreadcrumbItem className="hidden md:block">
                                    <BreadcrumbLink href="#">
                                        Eyplease
                                    </BreadcrumbLink>
                                </BreadcrumbItem>
                                <BreadcrumbSeparator className="hidden md:block" />
                                <BreadcrumbItem>
                                    <BreadcrumbPage>{labelPage || ''}</BreadcrumbPage>
                                </BreadcrumbItem>
                            </BreadcrumbList>
                        </Breadcrumb>
                    </div>
                    {/* El asistente IA responde sobre servicios: solo tiene sentido en esa page */}
                    {page === APP_ROUTES.SERVICES && <AssistantLauncher />}
                    <div className="ml-auto px-3">
                        <DarkModeSelector />
                    </div>
                    <div className="flex items-center gap-4">
                        <NotificationsDropdown />
                    </div>
                </header>
                <div className="relative min-h-screen">
                    {children}
                </div>
            </div>
        </SidebarInset>
    )
}

export default MainContainer
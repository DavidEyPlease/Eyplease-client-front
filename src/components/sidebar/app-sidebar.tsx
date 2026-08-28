import {
	ChevronRightIcon
} from "lucide-react"

import {
	Sidebar,
	SidebarContent,
	SidebarGroup,
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
	SidebarMenuSub,
	SidebarMenuSubButton,
	SidebarMenuSubItem,
	SidebarRail,
	useSidebar,
} from "@/components/ui/sidebar"
import useAuth from "@/hooks/useAuth"
import SidebarHeader from "./sidebar-header"
import useAuthStore from "@/store/auth"

import { ICONS } from "./icons"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "../ui/collapsible"
import { Link, useLocation } from "react-router"
import SidebarBillingCard from "@/components/billing/SidebarBillingCard"
import SidebarFooter from "./sidebar-footer"
import { SidebarFooterLoading, SidebarMenuLoading } from "./sidebar-skeleton"
import { useEffect } from "react"
import { APP_ROUTES } from "@/constants/app"
import BirthdayBanner from "@/pages/Dashboard/components/BirthdayBanner"

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
	const { user } = useAuth()
	const { sidebarMenu } = useAuthStore(state => state)
	const { state, isMobile, setOpenMobile } = useSidebar()
	const location = useLocation()

	useEffect(() => {
		if (isMobile && state === 'expanded') {
			setOpenMobile(false)
		}
	}, [location])

	return (
		<Sidebar collapsible="icon" {...props} className="shadow-[6px_0px_15px_0px_#00000024]">
			<SidebarHeader user={user} />
			<SidebarContent>
				<SidebarGroup>
					{!user ? <SidebarMenuLoading /> : (
						<SidebarMenu>
							{sidebarMenu.map((item) => {
								const Icon = ICONS[item.icon]
								const isActive = location.pathname.includes(item.path)
								return (
									item.children ? (
										<Collapsible
											key={item.key}
											asChild
											defaultOpen={isActive}
											className="group/collapsible"
										>
											<SidebarMenuItem>
												<CollapsibleTrigger asChild>
													<SidebarMenuButton tooltip={item.label}>
														{item.icon && <Icon />}
														<span>{item.label}</span>
														<ChevronRightIcon className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
													</SidebarMenuButton>
												</CollapsibleTrigger>
												<CollapsibleContent>
													<SidebarMenuSub>
														{item.children?.map((subItem) => (
															<SidebarMenuSubItem key={subItem.key}>
																<SidebarMenuSubButton asChild>
																	<Link to={subItem.path} className="text-sm text-white">
																		{subItem.label}
																	</Link>
																</SidebarMenuSubButton>
															</SidebarMenuSubItem>
														))}
													</SidebarMenuSub>
												</CollapsibleContent>
											</SidebarMenuItem>
										</Collapsible>
									) : (
										<SidebarMenuItem key={item.key}>
											<Link to={item.path}>
												<SidebarMenuButton
													isActive={isActive}
													tooltip={{
														children: item.label,
														hidden: state === 'expanded',
													}}
												>
													{item.icon && <Icon />}
													{item.label}
												</SidebarMenuButton>
											</Link>
										</SidebarMenuItem>
									)
								)
							})}
						</SidebarMenu>
					)}
				</SidebarGroup>
			</SidebarContent>
			{state === 'expanded' && !location.pathname.startsWith(APP_ROUTES.HOME.INITIAL) && (
				<BirthdayBanner variant="compact" />
			)}
			{/* Fuera del contenido scrolleable: el aviso de cobro no puede quedarse fuera de vista */}
			{state === 'expanded' && <SidebarBillingCard />}
			{user ? <SidebarFooter user={user} /> : <SidebarFooterLoading />}
			<SidebarRail />
		</Sidebar>
	)
}

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
import { Link } from "react-router"
import UserSubscription from "../generics/UserSubscription"
import SidebarFooter from "./sidebar-footer"

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
	const { user } = useAuth()
	const { sidebarMenu } = useAuthStore(state => state)
	const { state } = useSidebar()

	return (
		<Sidebar collapsible="icon" {...props} className="shadow-[6px_0px_15px_0px_#00000024]">
			{user && <SidebarHeader user={user} />}
			<SidebarContent>
				<SidebarGroup>
					<SidebarMenu>
						{sidebarMenu.map((item) => {
							const Icon = ICONS[item.icon]
							const isActive = location.pathname === item.path
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
				</SidebarGroup>

				{state === 'expanded' && <UserSubscription />}

			</SidebarContent>
			{user && <SidebarFooter user={user} />}
			<SidebarRail />
		</Sidebar>
	)
}

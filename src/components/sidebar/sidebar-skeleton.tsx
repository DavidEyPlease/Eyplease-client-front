import { Skeleton } from "@/components/ui/skeleton"
import {
	SidebarFooter as UISidebarFooter,
	SidebarMenu,
	SidebarMenuItem,
} from "@/components/ui/sidebar"
import { cn } from "@/lib/utils"

/** El sidebar es violeta: el gris por defecto del skeleton no se ve sobre él. */
const ON_SIDEBAR = "bg-white/15"

/** Anchos desiguales para que las filas no parezcan un código de barras. */
const MENU_ROW_WIDTHS = ["w-3/5", "w-2/5", "w-4/6", "w-1/2", "w-3/6", "w-2/3"]

/**
 * Esqueletos del sidebar mientras se resuelve la sesión.
 *
 * Ocupan el mismo hueco que los elementos reales para que al llegar la respuesta
 * no se monten de golpe ni salte el layout.
 */
export const SidebarMenuLoading = () => (
	<SidebarMenu>
		{MENU_ROW_WIDTHS.map(width => (
			<SidebarMenuItem key={width} className="flex h-8 items-center gap-2 px-2">
				<Skeleton className={cn("size-4 shrink-0 rounded-md", ON_SIDEBAR)} />
				<Skeleton className={cn("h-4", width, ON_SIDEBAR)} />
			</SidebarMenuItem>
		))}
	</SidebarMenu>
)

/** Fila de identidad: avatar + nombre y cuenta, con la misma métrica que el menú real. */
const SidebarIdentityLoading = () => (
	<div className="flex items-center gap-2 px-2 py-1.5">
		<Skeleton className={cn("size-8 shrink-0 rounded-full", ON_SIDEBAR)} />
		<div className="grid flex-1 gap-1.5">
			<Skeleton className={cn("h-3.5 w-3/5", ON_SIDEBAR)} />
			<Skeleton className={cn("h-2.5 w-2/5", ON_SIDEBAR)} />
		</div>
	</div>
)

/** El menú de usuario del pie, mientras no hay sesión resuelta. */
export const SidebarFooterLoading = () => (
	<UISidebarFooter>
		<SidebarMenu>
			<SidebarMenuItem>
				<SidebarIdentityLoading />
			</SidebarMenuItem>
		</SidebarMenu>
	</UISidebarFooter>
)

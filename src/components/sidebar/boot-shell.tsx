import PageLoader from "@/components/generics/PageLoader"
import {
	Sidebar,
	SidebarContent,
	SidebarGroup,
	SidebarInset,
	SidebarProvider,
} from "@/components/ui/sidebar"
import NewBootShell from "@/layouts/TopShell/BootShell"
import { isNewShell } from "@/layouts/TopShell/useNewShell"
import SidebarHeader from "./sidebar-header"
import { SidebarFooterLoading, SidebarMenuLoading } from "./sidebar-skeleton"

/**
 * La shell del área autenticada mientras arranca la sesión: misma silueta que la
 * real (sidebar con esqueletos y contenido cargando) pero sin un solo componente
 * que haga peticiones. Así nada puede adelantarse a /me ni al overview.
 *
 * Cada marco trae la suya: con el nuevo encendido para todas, esta de aquí enseñaba
 * el menú lateral de siempre en cada recarga y la app parecía cambiar de diseño sola
 * durante un segundo. La del marco nuevo vive en `TopShell/BootShell`.
 */
const OldBootShell = () => (
	<section className="flex">
		<SidebarProvider>
			<Sidebar collapsible="icon" className="shadow-[6px_0px_15px_0px_#00000024]">
				<SidebarHeader user={null} />
				<SidebarContent>
					<SidebarGroup>
						<SidebarMenuLoading />
					</SidebarGroup>
				</SidebarContent>
				<SidebarFooterLoading />
			</Sidebar>
			<SidebarInset className="relative min-h-screen p-[10px]">
				<PageLoader />
			</SidebarInset>
		</SidebarProvider>
	</section>
)

const BootShell = () => (isNewShell() ? <NewBootShell /> : <OldBootShell />)

export default BootShell

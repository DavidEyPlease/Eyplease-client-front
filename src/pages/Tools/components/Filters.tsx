import IconFlash from "@/components/Svg/IconFlash"
import { IconGrid } from "@/components/Svg/IconGrid"
import { IconPresentionChart } from "@/components/Svg/IconPresentionChart"
import { IToolsFilters, ToolSectionTypes } from "@/interfaces/tools"
import useAuth from "@/hooks/useAuth"
import { PermissionKeys } from "@/interfaces/permissions"
import FilterItem from "@/components/generics/FilterItem"
import { Carousel, CarouselContent, CarouselItem } from "@/components/ui/carousel"

interface ToolFiltersProps {
    filters: Partial<IToolsFilters>
    setFilter: (filters: Partial<IToolsFilters>) => void
}

const ToolFilters = ({ filters, setFilter }: ToolFiltersProps) => {
    const { hasAccess } = useAuth()

    return (
        <Carousel
            opts={{
                align: "start",
            }}
            className="w-full"
        >
            <CarouselContent>
                <CarouselItem className="basis-28">
                    <FilterItem<ToolSectionTypes>
                        title="Entérate Ya"
                        icon={<IconFlash />}
                        active={filters.section === ToolSectionTypes.STAY_INFORMED}
                        filterKey={ToolSectionTypes.STAY_INFORMED}
                        lock={!hasAccess(PermissionKeys.TOOLS_STAY_INFORMED)}
                        setFilter={(key) => setFilter({ ...filters, section: key })}
                    />
                </CarouselItem>
                <CarouselItem className="basis-28">
                    <FilterItem
                        title="Aprende"
                        icon={<IconGrid />}
                        active={filters.section === ToolSectionTypes.LEARN}
                        filterKey={ToolSectionTypes.LEARN}
                        lock={!hasAccess(PermissionKeys.TOOLS_LEARN)}
                        setFilter={(key) => setFilter({ ...filters, section: key })}
                    />
                </CarouselItem>
                <CarouselItem className="basis-28">
                    <FilterItem
                        title="Explica"
                        icon={<IconPresentionChart />}
                        active={filters.section === ToolSectionTypes.EXPLAIN}
                        filterKey={ToolSectionTypes.EXPLAIN}
                        lock={!hasAccess(PermissionKeys.TOOLS_EXPLAIN)}
                        setFilter={(key) => setFilter({ ...filters, section: key })}
                    />
                </CarouselItem>
                <CarouselItem className="basis-28">
                    <FilterItem
                        title="Propuestas"
                        icon={<IconGrid />}
                        active={filters.section === ToolSectionTypes.PROPOSALS}
                        filterKey={ToolSectionTypes.PROPOSALS}
                        lock={!hasAccess(PermissionKeys.TOOLS_PROPOSALS)}
                        setFilter={(key) => setFilter({ ...filters, section: key })}
                    />
                </CarouselItem>
                <CarouselItem className="basis-28">
                    <FilterItem
                        title="Productos"
                        icon={<IconGrid />}
                        active={filters.section === ToolSectionTypes.PRODUCTS}
                        filterKey={ToolSectionTypes.PRODUCTS}
                        lock={!hasAccess(PermissionKeys.TOOLS_PRODUCTS)}
                        setFilter={(key) => setFilter({ ...filters, section: key })}
                    />
                </CarouselItem>
                <CarouselItem className="basis-28">
                    <FilterItem
                        title="Inicia"
                        icon={<IconGrid />}
                        active={filters.section === ToolSectionTypes.GET_STARTED}
                        filterKey={ToolSectionTypes.GET_STARTED}
                        lock={!hasAccess(PermissionKeys.TOOLS_GET_STARTED)}
                        setFilter={(key) => setFilter({ ...filters, section: key })}
                    />
                </CarouselItem>
            </CarouselContent>
        </Carousel>
    )
}

export default ToolFilters
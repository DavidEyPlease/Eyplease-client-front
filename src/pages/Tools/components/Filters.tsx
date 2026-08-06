import { LockIcon } from 'lucide-react'

import FilterChip from '@/components/generics/FilterChip'
import { MAP_TOOLS_SECTIONS } from '@/constants/app'
import useAuth from '@/hooks/useAuth'
import { PermissionKeys } from '@/interfaces/permissions'
import { IToolsFilters, ToolSectionTypes } from '@/interfaces/tools'
import { TOOL_SECTION_ICON, TOOL_SECTIONS_ORDER } from '../utils'

const SECTION_PERMISSION: Record<ToolSectionTypes, PermissionKeys> = {
    [ToolSectionTypes.PROPOSALS]: PermissionKeys.TOOLS_PROPOSALS,
    [ToolSectionTypes.PRODUCTS]: PermissionKeys.TOOLS_PRODUCTS,
    [ToolSectionTypes.GET_STARTED]: PermissionKeys.TOOLS_GET_STARTED,
    [ToolSectionTypes.STAY_INFORMED]: PermissionKeys.TOOLS_STAY_INFORMED,
    [ToolSectionTypes.LEARN]: PermissionKeys.TOOLS_LEARN,
    [ToolSectionTypes.EXPLAIN]: PermissionKeys.TOOLS_EXPLAIN,
}

interface ToolFiltersProps {
    filters: Partial<IToolsFilters>
    setFilter: (filters: Partial<IToolsFilters>) => void
}

const ToolFilters = ({ filters, setFilter }: ToolFiltersProps) => {
    const { hasAccess } = useAuth()

    return (
        <div className="flex gap-2 overflow-x-auto pb-0.5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {TOOL_SECTIONS_ORDER.map(section => {
                const Icon = TOOL_SECTION_ICON[section]

                return (
                    <FilterChip
                        key={section}
                        label={MAP_TOOLS_SECTIONS[section]}
                        icon={<Icon />}
                        endIcon={!hasAccess(SECTION_PERMISSION[section]) ? <LockIcon className="opacity-60" /> : undefined}
                        active={filters.section === section}
                        className="shrink-0"
                        onClick={() => setFilter({ section })}
                    />
                )
            })}
        </div>
    )
}

export default ToolFilters


import DynamicTabs from "@/components/generics/DynamicTabs"
import FilterItem from "@/components/generics/FilterItem"
import { IconBySection } from "@/components/generics/IconBySection"
import useAuth from "@/hooks/useAuth"
import { PermissionKeys } from "@/interfaces/permissions"
import { IPostsFilters, MainPostSectionTypes, PostSectionTypes } from "@/interfaces/posts"
import useAuthStore from "@/store/auth"
import { useEffect, useMemo, useState } from "react"

interface Props {
    activeFilters: Partial<IPostsFilters>
    mainSection: MainPostSectionTypes
    setMainSection: (key: MainPostSectionTypes) => void
    setPostSection: (key: PostSectionTypes) => void
}

const FilterPosts = ({ activeFilters, mainSection, setMainSection, setPostSection }: Props) => {
    const { user } = useAuthStore(state => state)
    const { hasAccess } = useAuth()

    const acceses = useMemo(() => user?.plan.accesses || [], [user])
    const mainPostsMenu = acceses.filter(i => !!i.is_submodule && i.parent_module_key === PermissionKeys.POSTS && [PermissionKeys.POSTS_CLIENTS, PermissionKeys.POSTS_DIRECTORS, PermissionKeys.POSTS_UNITY].includes(i.permission_key))

    const [sections, setSections] = useState<Array<{ key: PermissionKeys, label: string }>>([])

    useEffect(() => {
        const mainSectionData = acceses.find(i => i.permission_key === mainSection.toString())
        if (mainSectionData) {
            setSections(mainSectionData.custom_permissions || [])
        }
    }, [mainSection, acceses])

    return (
        <div className="flex flex-col items-center gap-y-5">
            <DynamicTabs
                items={mainPostsMenu.map(i => {
                    return {
                        value: i.permission_key,
                        label: i.name,
                        disabled: !hasAccess(i.permission_key),
                        icon: <IconBySection sectionKey={i.permission_key} />
                    }
                })}
                value={mainSection.toString()}
                onValueChange={value => setMainSection(value as MainPostSectionTypes)}
            />
            <div className="flex flex-wrap gap-2">
                {(sections || []).map((c) => (
                    <FilterItem
                        key={c.key}
                        title={c.label}
                        icon={<IconBySection sectionKey={c.key} />}
                        active={activeFilters.section === c.key.toString()}
                        filterKey={c.key.toString()}
                        setFilter={(key) => setPostSection(key.toString() as PostSectionTypes)}
                    />
                ))}
            </div>
        </div>
    )
}

export default FilterPosts
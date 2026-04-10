import clsx from "clsx"
import { IconLock } from "../Svg/IconLock"
import { cn } from "@/lib/utils"

interface FilterItemProps<T> {
    title: string;
    icon: React.ReactNode;
    active?: boolean;
    filterKey: T
    lock?: boolean
    setFilter: (section: T) => void
}
const FilterItem = <T extends string>({ title, lock, icon, active, filterKey, setFilter }: FilterItemProps<T>) => {
    return (
        <button
            className={
                clsx(
                    "relative flex flex-col items-center justify-center w-24 py-3 cursor-pointer border-none rounded-lg group",
                    active ? 'bg-primary text-white' : 'bg-gray dark:bg-card'
                )
            }
            onClick={() => setFilter(filterKey)}
        >
            {lock &&
                <div className={cn('absolute top-1 right-5 w-1 h-1 text-primary dark:text-tertiary-light', {
                    'text-white': active,
                })}>
                    <IconLock />
                </div>
            }
            <div className={clsx(
                'grid size-8 mx-auto mb-1 border rounded-full text-primary place-content-center [&>svg]:size-4',
                active ? 'text-white bg-primary border-white' : 'group-hover:text-white group-hover:bg-primary border-primary transition-colors'
            )}>
                {icon}
            </div>
            <p className={clsx('text-xs', active ? 'text-white' : 'text-primary dark:text-white')}>{title}</p>
        </button>
    )
}

export default FilterItem
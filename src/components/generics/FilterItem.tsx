import clsx from "clsx"
import { IconLock } from "../Svg/IconLock"

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
                    "relative flex flex-col items-center justify-center w-24 py-3 border-none rounded-lg group",
                    lock ? 'cursor-not-allowed opacity-50' : 'cursor-pointer',
                    active ? 'bg-primary text-white' : 'bg-gray dark:bg-card'
                )
            }
            onClick={() => !lock && setFilter(filterKey)}
        >
            {lock &&
                <div className={'absolute top-1 right-5 w-1 h-1 text-tertiary-light'}>
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
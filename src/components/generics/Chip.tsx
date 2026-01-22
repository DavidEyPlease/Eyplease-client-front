import { clsx } from "clsx";

interface ChipProps {
    label: string;
    color?: string;
    icon?: React.ReactNode;
    className?: string;
}

const Chip = ({ className, label, icon, color = 'primary' }: ChipProps) => {
    return (
        <div className={clsx(className, `bg-${color}`, `border-${color}`, 'w-max', 'rounded-2xl', 'text-white', 'px-2', 'py-1', 'gap-1', 'flex', 'justify-center', 'items-center')}>
            {icon}
            <small className="text-xs">{label}</small>
        </div>
    )
}

export default Chip;
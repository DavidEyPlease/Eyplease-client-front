import { cn } from "@/lib/utils"

interface PageTitleProps {
    children: React.ReactNode
    className?: string
}

const PageTitle = ({ children, className }: PageTitleProps) => {
    return (
        <div className={cn(
            "grid place-content-center rounded-2xl py-4 md:py-2 text-center bg-primary-gradient text-white px-2",
            className
        )}>
            {children}
        </div>
    )
}

export default PageTitle
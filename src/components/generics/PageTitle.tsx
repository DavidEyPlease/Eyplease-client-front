import { cn } from "@/lib/utils"

interface PageTitleProps {
    children: React.ReactNode
    className?: string
}

const PageTitle = ({ children, className }: PageTitleProps) => {
    return (
        <div className={cn(
            "grid place-content-center rounded-2xl text-center bg-gradient-to-r from-blue-600 to-purple-600 h-28 text-white",
            className
        )}>
            {children}
        </div>
    )
}

export default PageTitle
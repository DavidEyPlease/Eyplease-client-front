import { ChevronDownIcon } from "lucide-react"

import { Button } from "@/components/ui/button"

interface Props {
    loading: boolean;
    disabled?: boolean;
    onLoadMore: () => void;
}

const LoadMorePaginator = ({ loading, disabled, onLoadMore }: Props) => {
    return (
        <div className="my-7 flex items-center gap-4 before:h-px before:flex-1 before:bg-border before:content-[''] after:h-px after:flex-1 after:bg-border after:content-['']">
            <Button
                variant="outline"
                disabled={disabled || loading}
                onClick={onLoadMore}
                className="h-auto cursor-pointer rounded-full border-primary/25 px-5 py-2.5 text-[13px] font-bold text-primary transition-all hover:-translate-y-px hover:bg-primary/5 hover:text-primary hover:shadow-primary-glow"
            >
                <ChevronDownIcon />
                {loading ? 'Cargando…' : 'Cargar más'}
            </Button>
        </div>
    )
}

export default LoadMorePaginator

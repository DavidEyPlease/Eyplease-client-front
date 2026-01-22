import {
    Pagination,
    PaginationContent,
    PaginationItem,
    PaginationNext,
    PaginationPrevious,
} from "@/components/ui/pagination"

interface Props {
    nextCursor: string | null
    prevCursor: string | null
    lastPage: boolean
    onPaginate: (cursor: string) => void
}

const CursorPaginator = ({ lastPage, nextCursor, prevCursor, onPaginate }: Props) => {
    return (
        <Pagination className="justify-end flex-1 w-max">
            <PaginationContent>
                <PaginationItem>
                    <PaginationPrevious
                        onClick={() => !prevCursor ? undefined : onPaginate(prevCursor)}
                        className={!prevCursor ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                    />
                </PaginationItem>
                <PaginationItem>
                    <PaginationNext
                        onClick={() => !nextCursor || lastPage ? undefined : onPaginate(nextCursor)}
                        className={!nextCursor || lastPage ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                    />
                </PaginationItem>
            </PaginationContent>
        </Pagination>
    )
}

export default CursorPaginator;
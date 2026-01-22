import Button from "../common/Button"

interface Props {
    loading: boolean;
    disabled?: boolean;
    onLoadMore: () => void;
}

const LoadMorePaginator = ({ loading, disabled, onLoadMore }: Props) => {
    return (
        <div
            className="fter:h-px my-16 flex items-center before:h-px before:flex-1  before:bg-muted-foreground before:content-[''] after:h-px after:flex-1 after:bg-muted-foreground  after:content-['']">
            <Button
                text={
                    <div className="flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 mr-1">
                            <path fillRule="evenodd"
                                d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"
                                clipRule="evenodd" />
                        </svg>
                        {loading ? 'Cargando...' : 'Cargar más'}
                    </div>
                }
                rounded
                size="sm"
                variant="outline"
                disabled={disabled || loading}
                loading={loading}
                onClick={onLoadMore}
            />
        </div>
    )
}

export default LoadMorePaginator
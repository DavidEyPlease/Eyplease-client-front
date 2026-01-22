import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"
import { toast } from "sonner"
import { DeleteIcon } from "lucide-react"
import useRequestQuery from "@/hooks/useRequestQuery"

interface Props {
    apiEndpoint: string;
    invalidateQueryKey?: string;
    disabled?: boolean;
    onSuccess?: () => void;
}

const ApiDeleteButton = ({ apiEndpoint, disabled, invalidateQueryKey, onSuccess }: Props) => {
    const { request, requestState } = useRequestQuery({
        // ...(invalidateQueryKey ? { invalidateQueries: [...queryKeys.lists()] } : {}),
        onSuccess: () => {
            toast.success('Registro eliminado correctamente')
            onSuccess?.()
        },
        onError: (error) => {
            toast.error(`Error al eliminar el item: ${error.message}`)
        }
    })

    const handleDelete = () => request('DELETE', apiEndpoint)

    return (
        <AlertDialog>
            <AlertDialogTrigger asChild>
                <button
                    // onClick={() => handleDelete(user.id)}
                    className="p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                    title="Eliminar usuario"
                    disabled={requestState.loading}
                >
                    <DeleteIcon className="w-4 h-4" />
                </button>
                {/* <Button
                    size="icon"
                    variant="ghost"
                    className="text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                    disabled={requestState.loading}
                >
                    <DeleteIcon className="w-4 h-4" />
                </Button> */}
            </AlertDialogTrigger>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>¿Está completamente seguro?</AlertDialogTitle>
                    <AlertDialogDescription>
                        Esta acción no se puede deshacer. ¿Estás seguro de que deseas continuar?
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                    <AlertDialogAction
                        disabled={requestState.loading || disabled}
                        onClick={handleDelete}
                    >
                        {/* {requestState.loading && <Loader />} */}
                        Confirmar
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    )
}

export default ApiDeleteButton
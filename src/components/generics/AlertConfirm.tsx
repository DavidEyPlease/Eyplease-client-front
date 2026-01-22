import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import Button from "../common/Button"
import { InfoIcon } from "lucide-react"

interface Props {
    title?: string
    trigger: React.ReactNode
    description?: string
    loading?: boolean
    onConfirm: () => void
}

const TITLE = 'Segura de realizar esta acción?'
const DESCRIPTION = 'Esta acción eliminara el registro seleccionado'

const AlertConfirm = ({ trigger, loading, title = TITLE, description = DESCRIPTION, onConfirm }: Props) => {
    return (
        <AlertDialog>
            <AlertDialogTrigger asChild>
                {trigger}
            </AlertDialogTrigger>
            <AlertDialogContent className="rounded-xl">
                <AlertDialogHeader>
                    <AlertDialogTitle>{title}</AlertDialogTitle>
                    <AlertDialogDescription>
                        {description}
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <InfoIcon className="mx-auto size-28 py-5 text-orange-300" />
                <AlertDialogFooter>
                    <AlertDialogCancel className=" rounded-full">Cancelar</AlertDialogCancel>
                    <AlertDialogAction asChild className="text-white rounded-full">
                        <Button
                            text='Continuar'
                            rounded
                            loading={loading}
                            onClick={onConfirm}
                        />
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    )
}

export default AlertConfirm
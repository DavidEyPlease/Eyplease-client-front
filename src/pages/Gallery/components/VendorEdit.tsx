import Button from "@/components/common/Button"
import Modal from "@/components/common/Modal"
import { ISponsored } from "@/interfaces/sponsored"
import { useState } from "react"
import VendorForm from "./VendorForm"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { ChevronDownIcon } from "lucide-react"
import AlertConfirm from "@/components/generics/AlertConfirm"
import Spinner from "@/components/common/Spinner"
import useSponsoredActions from "../hooks/useSponsoredActions"

interface Props {
    sponsored: ISponsored
}

const DROPDOWN_ITEM_STYLES = 'cursor-pointer hover:bg-primary/10 transition-colors duration-200'

const VendorEdit = ({ sponsored }: Props) => {
    const [openEdit, setOpenEdit] = useState(false)
    const { actionLoading, onRemoveVendor, onDisplayVendor } = useSponsoredActions()

    return (
        <>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button
                        text={
                            <div className="flex items-center gap-2">
                                Acciones
                                <ChevronDownIcon className="size-5" />
                            </div>
                        }
                        rounded
                        block
                    />
                </DropdownMenuTrigger>

                <DropdownMenuContent side='top' className="w-80 bg-popover/95 backdrop-blur-md border-border animate-slide-down">
                    <DropdownMenuLabel className="text-foreground font-semibold">
                        Acciones disponibles
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator className="bg-border" />

                    <DropdownMenuItem
                        onClick={() => setOpenEdit(true)}
                        className={DROPDOWN_ITEM_STYLES}
                    >
                        Editar
                    </DropdownMenuItem>
                    <DropdownMenuItem
                        className={DROPDOWN_ITEM_STYLES}
                        disabled={actionLoading === 'update'}
                        onClick={(e) => {
                            e.preventDefault()
                            onDisplayVendor(sponsored)
                        }}
                    >
                        <div className="flex items-center justify-between w-full">
                            {sponsored.display_in_reports ? 'Ocultar en reportes' : 'Mostrar en reportes'}
                            {actionLoading === 'update' && (
                                <div className="ml-2">
                                    <Spinner />
                                </div>
                            )}
                        </div>
                    </DropdownMenuItem>
                    <AlertConfirm
                        trigger={
                            <DropdownMenuItem
                                disabled={actionLoading === 'remove'}
                                className={DROPDOWN_ITEM_STYLES}
                                onSelect={(e) => e.preventDefault()}
                            >
                                <div className="flex items-center justify-between w-full">
                                    Remover de mi lista
                                    {actionLoading === 'remove' && (
                                        <div className="ml-2">
                                            <Spinner />
                                        </div>
                                    )}
                                </div>
                            </DropdownMenuItem>
                        }
                        description='La vendedora dejara de pertenecer a tu lista de vendedoras'
                        // loading={requestState.loading}
                        onConfirm={() => onRemoveVendor(sponsored.id)}
                    />
                </DropdownMenuContent>
            </DropdownMenu>
            <Modal open={openEdit} onOpenChange={setOpenEdit} title="Editar">
                <VendorForm sponsored={sponsored} onSuccess={() => setOpenEdit(false)} />
            </Modal>
        </>
    )
}

export default VendorEdit
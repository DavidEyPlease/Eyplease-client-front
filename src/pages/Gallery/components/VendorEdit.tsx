import { useState } from "react"
import { EllipsisIcon, EyeIcon, EyeOffIcon, PencilIcon, Trash2Icon } from "lucide-react"

import Modal from "@/components/common/Modal"
import Spinner from "@/components/common/Spinner"
import AlertConfirm from "@/components/generics/AlertConfirm"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { ISponsored } from "@/interfaces/sponsored"
import useSponsoredActions from "../hooks/useSponsoredActions"
import VendorForm from "./VendorForm"

interface Props {
    sponsored: ISponsored
}

const DROPDOWN_ITEM_STYLES = 'cursor-pointer rounded-lg py-2 font-medium transition-colors'

const VendorEdit = ({ sponsored }: Props) => {
    const [openEdit, setOpenEdit] = useState(false)
    const { actionLoading, onRemoveVendor, onDisplayVendor } = useSponsoredActions()

    const DisplayIcon = sponsored.display_in_reports ? EyeOffIcon : EyeIcon

    return (
        <>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button
                        variant="ghost"
                        size="icon-sm"
                        aria-label="Acciones"
                        className="absolute top-2.5 right-2.5 cursor-pointer rounded-[10px] border border-transparent text-muted-foreground hover:border-border hover:bg-surface-soft hover:text-primary"
                    >
                        <EllipsisIcon />
                    </Button>
                </DropdownMenuTrigger>

                <DropdownMenuContent align="end" className="w-60 rounded-2xl border-border bg-popover/95 p-1.5 shadow-card-hover backdrop-blur-md">
                    <DropdownMenuLabel className="text-[11px] font-bold tracking-wide text-muted-foreground uppercase">
                        Acciones disponibles
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator className="bg-border" />

                    <DropdownMenuItem
                        onClick={() => setOpenEdit(true)}
                        className={DROPDOWN_ITEM_STYLES}
                    >
                        <PencilIcon />
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
                        <DisplayIcon />
                        {sponsored.display_in_reports ? 'Ocultar en reportes' : 'Mostrar en reportes'}
                        {actionLoading === 'update' && <Spinner size="xs" className="ml-auto w-auto" />}
                    </DropdownMenuItem>
                    <AlertConfirm
                        trigger={
                            <DropdownMenuItem
                                variant="destructive"
                                disabled={actionLoading === 'remove'}
                                className={DROPDOWN_ITEM_STYLES}
                                onSelect={(e) => e.preventDefault()}
                            >
                                <Trash2Icon />
                                Remover de mi lista
                                {actionLoading === 'remove' && <Spinner size="xs" className="ml-auto w-auto" />}
                            </DropdownMenuItem>
                        }
                        description='La vendedora dejara de pertenecer a tu lista de vendedoras'
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

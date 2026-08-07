import { VideoIcon, MapPinIcon, XIcon } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Drawer, DrawerClose, DrawerContent, DrawerHeader, DrawerTitle } from '@/components/ui/drawer'
import MetaPill from '@/components/generics/MetaPill'
import { Separator } from '@/components/ui/separator'
import { EVENT_TYPES_LABEL } from '@/constants/app'
import { EventType, IEvent } from '@/interfaces/events'
import ServiceWorkspace from '../../../components/ServiceWorkspace'
import CorrectionComposer from '../../../components/ServiceWorkspace/CorrectionComposer'
import ServiceStatusBadge from '../../../ServiceRequests/components/StatusBadge'
import EventFacts from '../EventFacts'

interface Props {
    item: IEvent | null
    open: boolean
    onOpenChange: (open: boolean) => void
}

/** Expediente del evento en drawer: datos del evento + workspace del servicio de diseño ligado. */
const EventDetail = ({ item, open, onOpenChange }: Props) => {
    return (
        <Drawer direction="right" open={open && !!item} onOpenChange={onOpenChange}>
            <DrawerContent className="w-full data-[vaul-drawer-direction=right]:sm:max-w-xl">
                {item && (
                    <>
                        <DrawerHeader className="flex flex-row items-center gap-2.5 border-b p-3.5">
                            <DrawerTitle className="min-w-0 flex-1 truncate text-left text-sm font-extrabold tracking-tight">
                                {item.title}
                            </DrawerTitle>
                            {item.service && <ServiceStatusBadge status={item.service.status} />}
                            <DrawerClose asChild>
                                <Button variant="ghost" size="icon-sm" className="shrink-0 cursor-pointer text-muted-foreground" aria-label="Cerrar">
                                    <XIcon />
                                </Button>
                            </DrawerClose>
                        </DrawerHeader>

                        <div className="flex flex-1 flex-col gap-4 overflow-y-auto p-4">
                            <div className="flex flex-wrap items-center gap-1.5">
                                <MetaPill icon={item.event_type === EventType.ONLINE ? <VideoIcon aria-hidden /> : <MapPinIcon aria-hidden />}>
                                    {EVENT_TYPES_LABEL[item.event_type]}
                                </MetaPill>
                            </div>

                            {item.description && (
                                <p className="text-[12.5px] leading-relaxed font-medium text-muted-foreground">{item.description}</p>
                            )}

                            <EventFacts event={item} />

                            {item.service && (
                                <>
                                    <Separator />
                                    <ServiceWorkspace item={item.service} showHeader={false} showComposer={false} />
                                </>
                            )}
                        </div>

                        {/* El redactor de corrección queda fijo al pie: siempre a mano, sin buscarlo al final del scroll */}
                        {item.service && (
                            <div className="border-t bg-surface-soft p-3">
                                <CorrectionComposer itemId={item.service.id} />
                            </div>
                        )}
                    </>
                )}
            </DrawerContent>
        </Drawer>
    )
}

export default EventDetail

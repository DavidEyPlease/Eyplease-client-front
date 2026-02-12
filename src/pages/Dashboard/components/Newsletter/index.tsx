import CardBgImage from "@/components/generics/CardBgImage"
import { IconEye } from "@/components/Svg/IconEye"
import useAuthStore from "@/store/auth"
import { Card, CardAction, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { useEffect, useState } from "react"
import Button from "@/components/common/Button"
import Spinner from "@/components/common/Spinner"
import NewsletterSections from "./Sections"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { CheckCheckIcon, ChevronDownIcon } from "lucide-react"

const Newsletter = () => {
    const { user, utilData, initialLoading } = useAuthStore(state => state)
    const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null)
    const [reportFileType, setReportFileType] = useState<'pdf' | 'pptx' | null>(null)
    const [openModal, setOpenModal] = useState(false)

    const onSelectReportFileType = (type: 'pdf' | 'pptx') => {
        setReportFileType(type)
        setOpenModal(true)
    }

    useEffect(() => {
        if (user && user.template_id) {
            setSelectedTemplate(user.template_id)
        }
    }, [user])

    return (
        <Card className="grid col-span-3 rounded-xl">
            <CardHeader>
                <CardTitle>Boletin del mes</CardTitle>
                <CardDescription>Selecciona una plantilla para generar el boletin de unidad</CardDescription>
                <CardAction>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button
                                text={
                                    <div className="flex items-center gap-2">
                                        Generar Boletín
                                        <ChevronDownIcon className="size-5" />
                                    </div>
                                }
                                color="primary"
                                rounded
                                disabled={!selectedTemplate}
                            />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="bg-popover/95 backdrop-blur-md border-border animate-slide-down">
                            <DropdownMenuLabel className="text-foreground font-semibold">
                                Selecciona el tipo de boletín
                            </DropdownMenuLabel>
                            <DropdownMenuSeparator className="bg-border" />

                            <DropdownMenuItem
                                onClick={() => onSelectReportFileType('pdf')}
                                className="cursor-pointer hover:bg-primary/10 transition-colors duration-200"
                            >
                                PDF
                            </DropdownMenuItem>
                            <DropdownMenuItem
                                onClick={() => onSelectReportFileType('pptx')}
                                className="cursor-pointer hover:bg-primary/10 transition-colors duration-200"
                            >
                                Power Point
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                    {selectedTemplate &&
                        <NewsletterSections
                            open={openModal}
                            selectedTemplate={selectedTemplate}
                            reportFileType={reportFileType}
                            onClose={() => setOpenModal(false)}
                        />
                    }
                </CardAction>
            </CardHeader>

            <CardContent>
                {initialLoading ? (
                    <Spinner color="primary" />
                ) : (
                    <>
                        <p className="mb-2 font-semibold">Plantillas disponibles</p>
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
                            {utilData.templates.map(template => (
                                <Card className="p-0 gap-0" key={template.id}>
                                    <button
                                        className="relative"
                                        key={template.id}
                                        onClick={() => setSelectedTemplate(template.id)}
                                    >
                                        <CardBgImage className="h-40" srcImage={template.picture.url} objectPosition="object-cover" classImageHeight="h-40">
                                            {selectedTemplate === template.id && <div className="absolute w-full h-40 rounded-sm opacity-65 bg-slate-700"></div>}
                                            <div className="absolute cursor-pointer grid w-6 h-6 bg-white rounded-full text-slate-900 top-3 right-3 place-content-center">
                                                <IconEye />
                                            </div>
                                        </CardBgImage>
                                    </button>
                                    <CardFooter className="py-3 justify-between">
                                        <p className="text-sm font-medium">{template.name}</p>
                                        {selectedTemplate === template.id && (
                                            <CheckCheckIcon className="text-success" />
                                        )}
                                    </CardFooter>
                                </Card>
                            ))}
                        </div>
                    </>
                )}

            </CardContent>
        </Card>
    )
}

export default Newsletter
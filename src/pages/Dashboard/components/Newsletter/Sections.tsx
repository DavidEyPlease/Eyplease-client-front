import Button from "@/components/common/Button"
import { Button as UIButton } from "@/components/ui/button"
import Modal from "@/components/common/Modal"
import IconDownload from "@/components/Svg/IconDownload"
import { Newsletter, NewsletterSectionKeys, NewsletterTypes } from "@/interfaces/common"
import useAuthStore from "@/store/auth"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { useEffect, useState } from "react"
import DynamicTabs from "@/components/generics/DynamicTabs"
import { generatePdfReport, generatePptxReport } from "@/services/reports/reportGenerator"

interface Props {
    open: boolean;
    reportFileType: 'pdf' | 'pptx' | null;
    onClose: () => void;
    selectedTemplate: string;
}

const filterSectionsByType = (newsletters: Newsletter[], type: NewsletterTypes) => {
    return newsletters.find(i => i.code === type)?.sections.filter(i => !!i.showInNewsletter)
}

const NewsletterSections = ({ open, selectedTemplate, onClose, reportFileType }: Props) => {
    const { utilData } = useAuthStore(state => state)
    const [newsletterType, setNewsletterType] = useState<NewsletterTypes>(NewsletterTypes.UNITY)
    const [selectedSections, setSelectedSections] = useState<NewsletterSectionKeys[]>(filterSectionsByType(utilData.newsletters, NewsletterTypes.UNITY)?.map(i => i.sectionKey) || [])

    // Dispara la generación en segundo plano y cierra el modal de inmediato: el
    // progreso y la descarga los gestiona el centro de tareas (toast), de modo que
    // el usuario puede seguir navegando mientras el archivo se construye.
    const generateReport = () => {
        if (!reportFileType) return

        const title = utilData.newsletters.find(n => n.code === newsletterType)?.name || 'Boletín'
        const params = {
            templateId: selectedTemplate,
            reportType: newsletterType,
            sections: selectedSections,
            title,
        }

        if (reportFileType === 'pdf') generatePdfReport(params)
        if (reportFileType === 'pptx') generatePptxReport(params)

        onClose()
        setSelectedSections([])
    }

    const onSelectAll = () => {
        const sections = filterSectionsByType(utilData.newsletters, newsletterType)?.map(i => i.sectionKey) || []
        if (selectedSections.length === sections.length) {
            setSelectedSections([])
        } else {
            setSelectedSections(sections)
        }
    }

    useEffect(() => {
        setSelectedSections(filterSectionsByType(utilData.newsletters, newsletterType)?.map(i => i.sectionKey) || [])
    }, [utilData.newsletters, newsletterType])

    const sections = filterSectionsByType(utilData.newsletters, newsletterType)

    return (
        <Modal
            open={open}
            onOpenChange={onClose}
            title="Secciones del boletín"
            footer={
                <Button
                    text={
                        <div className="flex items-center gap-2">
                            <IconDownload />
                            <span>Descargar boletín</span>
                        </div>
                    }
                    block
                    color="primary"
                    rounded
                    disabled={!selectedTemplate}
                    onClick={generateReport}
                />
            }
        >
            {/* <div className="mx-auto">
                <Button
                    text='Condiciones de boletín'
                    color="primary"
                    rounded
                    size="sm"
                    variant="outline"
                    disabled={!selectedTemplate}
                />
            </div> */}

            <DynamicTabs
                items={utilData.newsletters.map(n => ({ label: n.name, value: n.code }))}
                value={newsletterType}
                onValueChange={value => setNewsletterType(value as NewsletterTypes)}
            />

            <div className="space-y-4 mt-4">
                {(sections || []).map(section => {
                    const selected = selectedSections.includes(section.sectionKey)
                    return (
                        <div className="flex items-center space-x-2" key={section.sectionKey}>
                            <Checkbox
                                id={section.sectionKey}
                                checked={selected}
                                onCheckedChange={(e) => e ? setSelectedSections([...selectedSections, section.sectionKey]) : setSelectedSections(selectedSections.filter(i => i !== section.sectionKey))}
                            />
                            <Label
                                htmlFor={section.sectionKey}
                                className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                            >
                                {section.name}
                            </Label>
                        </div>
                    )
                })}
                <div className="text-right">
                    <UIButton variant='ghost' className="text-primary" size='sm' onClick={onSelectAll}>
                        {sections && sections.length > 0 && (selectedSections.length === sections.length ? 'Deseleccionar todo' : 'Seleccionar todo')}
                    </UIButton>
                </div>
            </div>
        </Modal>
    )
}

export default NewsletterSections
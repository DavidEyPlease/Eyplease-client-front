import Button from "@/components/common/Button"
import Modal from "@/components/common/Modal"
import IconDownload from "@/components/Svg/IconDownload"
import { API_ROUTES } from "@/constants/api"
import useRequest from "@/hooks/useRequest"
import { ApiResponse, NewsletterSectionKeys, NewsletterTypes, ReportBackgrounds } from "@/interfaces/common"
import useAuthStore from "@/store/auth"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { anchorDownload, objectToQueryParams } from "@/utils"
import { useEffect, useState } from "react"
import DynamicTabs from "@/components/generics/DynamicTabs"
import { toast } from "sonner"
import { INationalMonthlyReport, IUnityMonthlyReport } from "@/interfaces/monthlyReports"
import usePptxGeneratorStore from "@/store/pptxGenerator"

interface Props {
    open: boolean;
    reportFileType: 'pdf' | 'pptx' | null;
    onClose: () => void;
    selectedTemplate: string;
}

const NewsletterSections = ({ open, selectedTemplate, onClose, reportFileType }: Props) => {
    const { utilData, user } = useAuthStore(state => state)
    const [newsletterType, setNewsletterType] = useState<NewsletterTypes>(NewsletterTypes.UNITY)
    const [selectedSections, setSelectedSections] = useState<NewsletterSectionKeys[]>([])
    const { request, requestState } = useRequest('GET')
    const { startPptxUnityProcess, startPptxNationalProcess } = usePptxGeneratorStore(state => state)

    const onSuccessReport = () => {
        toast.success('Boletín generado correctamente.')
        setSelectedSections([])
        onClose()
    }

    const generateReport = async () => {
        try {
            const q = objectToQueryParams({
                sections: selectedSections.join(','),
            })
            if (reportFileType === 'pdf') {
                const response = await request<ApiResponse<{ url: string, filename: string }>, unknown>(
                    API_ROUTES.REPORTS.GENERATE_REPORT_PDF.replace('{templateId}', selectedTemplate).replace('{reportType}', newsletterType) + `?${q}`
                )
                if (response.success && response.data) {
                    // Download pdf
                    anchorDownload(response.data.url, response.data.filename, '_blank')
                    onSuccessReport()
                }
            }
            if (reportFileType === 'pptx') {
                const response = await request<ApiResponse<{ template_resources: ReportBackgrounds, report: IUnityMonthlyReport | INationalMonthlyReport }>, unknown>(
                    API_ROUTES.REPORTS.GENERATE_REPORT_PPTX.replace('{templateId}', selectedTemplate).replace('{reportType}', newsletterType) + `?${q}`
                )
                if (response.success && response.data && user) {
                    onClose()
                    setSelectedSections([])
                    const { template_resources, report } = response.data
                    if (template_resources.type === NewsletterTypes.UNITY) {
                        startPptxUnityProcess(template_resources, report as IUnityMonthlyReport, user, selectedSections)
                    }
                    if (template_resources.type === NewsletterTypes.NATIONAL) {
                        startPptxNationalProcess(template_resources, report as INationalMonthlyReport, user, selectedSections)
                    }
                }
            }
        } catch (error) {
            console.error(error)
            toast.error('Error al generar el boletín. Por favor, intenta de nuevo.')
        }
    }

    useEffect(() => {
        setSelectedSections([])
    }, [newsletterType])

    const sections = utilData.newsletters.find(i => i.code === newsletterType)?.sections.filter(i => !!i.showInNewsletter)
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
                    loading={requestState.loading}
                    onClick={generateReport}
                />
            }
        >
            <div className="mx-auto">
                <Button
                    text='Condiciones de boletín'
                    color="primary"
                    rounded
                    size="sm"
                    variant="outline"
                    disabled={!selectedTemplate}
                />
            </div>

            <DynamicTabs
                items={utilData.newsletters.map(n => ({ label: n.name, value: n.code }))}
                value={newsletterType}
                onValueChange={value => setNewsletterType(value as NewsletterTypes)}
            />

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
        </Modal>
    )
}

export default NewsletterSections
import FileSelector from "@/components/generics/FileSelector"
import { IconDocUpload } from "@/components/Svg/IconDocUpload"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { NewsletterSection } from "@/interfaces/common"
import { IReportUpload } from "@/interfaces/reportUpload"
import { cn } from "@/lib/utils"
import { formatDate } from "@/utils/dates"
import { MAP_LABEL_STATUS, REPORT_SECTIONS_IN_CURRENT_MONTH } from "../lib"

interface ReportItemProps {
    loadedReport?: IReportUpload | null
    reportSection: NewsletterSection
    onUploadReport: (file: File, reportSection: NewsletterSection) => void
}

const CURRENT_MONTH = new Date().toLocaleString('default', { month: 'long' })
const PREVIOUS_MONTH = new Date(new Date().setMonth(new Date().getMonth() - 1)).toLocaleString('default', { month: 'long' })

const ReportItem = ({ reportSection, loadedReport, onUploadReport }: ReportItemProps) => {
    const hasLoaded = !!loadedReport

    const getReportMonth = () => {
        if (loadedReport) {
            return formatDate(loadedReport.year_month, { formatter: 'MMMM' })
        }
        if (REPORT_SECTIONS_IN_CURRENT_MONTH.includes(reportSection.sectionKey)) {
            return CURRENT_MONTH
        }
        return PREVIOUS_MONTH
    }

    return (
        <FileSelector
            // disabled={requestState.loading}
            fileUploaderComponent={
                <Card className="w-full mb-3 relative hover:bg-muted/50">
                    <div className="flex items-center px-3 py-1 space-x-2">
                        <div className="flex-1 space-y-1 relative">
                            <p className="text-sm font-medium leading-none">
                                {reportSection.name}
                            </p>
                            <div className="flex items-center space-x-2">
                                <Badge
                                    className={cn({
                                        'bg-emerald-500': hasLoaded,
                                    }, 'text-white')}
                                >
                                    {hasLoaded ? MAP_LABEL_STATUS[loadedReport?.status] : 'Cargar reporte'}
                                </Badge>
                                <p className="text-xs text-muted-foreground">
                                    Reporte de {getReportMonth()}
                                </p>
                            </div>
                            {hasLoaded && (<small className="text-xs text-muted-foreground absolute -bottom-5 -right-8">Fecha de carga: {formatDate(loadedReport?.created_at)}</small>)}
                        </div>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <button className="flex cursor-pointer justify-center items-center size-8 text-primary dark:text-white rounded-full bg-slate-200 dark:bg-primary">
                                    <IconDocUpload />
                                </button>
                            </TooltipTrigger>
                            <TooltipContent>
                                <p>Presiona para cargar el reporte</p>
                            </TooltipContent>
                        </Tooltip>
                    </div>
                </Card>
            }
            fileAccepts=".xlsx"
            onSelectedFile={e => onUploadReport(e, reportSection)}
        />
    )
}

export default ReportItem
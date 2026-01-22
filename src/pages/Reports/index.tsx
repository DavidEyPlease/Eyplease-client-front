import useAuthStore from "@/store/auth"
import ReportItem from "./components/ReportItem"
import useFetchQuery from "@/hooks/useFetchQuery"
import { API_ROUTES } from "@/constants/api"
import { queryKeys } from "@/utils/cache"
import { IReportUpload } from "@/interfaces/reportUpload"
import { ConflictHeadingsError, ConflictUsersError, findReportLoaded, hasConflictHeadingsStructure, hasConflictUsersStructure } from "./lib"
import { NewsletterSection } from "@/interfaces/common"
import useRequestQuery from "@/hooks/useRequestQuery"
import { publishEvent } from "@/utils/events"
import { BROWSER_EVENTS } from "@/constants/app"
import { useState } from "react"
import FeedbackUploadReport from "./components/FeedbackUploadReport"
import { toast } from "sonner"
import PageLoader from "@/components/generics/PageLoader"

const ReportsPage = () => {
    const [uploadError, setUploadError] = useState<ConflictUsersError | ConflictHeadingsError | null>(null)

    const { utilData } = useAuthStore(state => state)

    const { response, loading } = useFetchQuery<IReportUpload[]>(API_ROUTES.REPORTS.LIST_UPLOADS, {
        customQueryKey: queryKeys.list('report-uploads'),
        enabled: !!utilData.newsletters.length,
    })

    const { request, requestState } = useRequestQuery({
        invalidateQueries: [queryKeys.list('report-uploads')],
        onSuccess: () => {
            setUploadError(null)
            toast.success('Reporte cargado correctamente')
            publishEvent(BROWSER_EVENTS.CLEAR_FILE_UPLOADER, true)
        },
        onError: (e) => {
            publishEvent(BROWSER_EVENTS.CLEAR_FILE_UPLOADER, true)
            if (hasConflictUsersStructure(e) || hasConflictHeadingsStructure(e)) {
                setUploadError(e)
            }
        }
    })

    const onUploadReport = async (file: File, reportSection: NewsletterSection) => {
        if (!file || !reportSection) {
            return
        }

        const formData = new FormData()
        formData.append('newsletter_section_id', reportSection.id)
        formData.append('file', file)

        await request('POST', API_ROUTES.REPORTS.UPLOAD, formData)
    }

    return (
        <div className="grid grid-cols-1 space-x-4 md:grid-cols-2">
            {loading ? (
                <PageLoader />
            ) : (
                <>
                    {utilData.newsletters.map(n => (
                        <div className="p-4 bg-card border rounded-md" key={n.id}>
                            <p className="mb-3">{n.name}</p>
                            <div className="grid gap-2">
                                {n.sections.filter(i => !!i.canImported).map(s => {
                                    const loadedReport = findReportLoaded((response?.data || []), s.id)
                                    return <ReportItem
                                        key={s.id}
                                        reportSection={s}
                                        loadedReport={loadedReport}
                                        onUploadReport={onUploadReport}
                                    />
                                })}
                            </div>
                        </div>
                    ))}
                    <FeedbackUploadReport
                        loading={requestState.loading}
                        open={!!uploadError || requestState.loading}
                        uploadError={uploadError}
                        onClose={() => setUploadError(null)}
                    />
                </>
            )}
        </div>
    )
}

export default ReportsPage
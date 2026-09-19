import { useMemo } from 'react'

import { API_ROUTES } from '@/constants/api'
import useFetchQuery from '@/hooks/useFetchQuery'
import { NewsletterTypes } from '@/interfaces/common'
import { IReportUpload } from '@/interfaces/reportUpload'
import useAuthStore from '@/store/auth'
import { queryKeys } from '@/utils/cache'
import { getImportableSections, resolveSectionReport } from './lib'

/**
 * Cómo van los reportes del mes: cuántos hay cargados y cuáles faltan, de un boletín o de todos.
 * Comparte consulta (y caché) con la página de Reportes, así que subir uno allá se refleja aquí.
 */
const useReportsStatus = (type?: NewsletterTypes | null) => {
    const newsletters = useAuthStore(state => state.utilData.newsletters)

    const { response, loading } = useFetchQuery<IReportUpload[]>(API_ROUTES.REPORTS.LIST_UPLOADS, {
        customQueryKey: queryKeys.list('report-uploads'),
        enabled: !!newsletters.length,
    })

    return useMemo(() => {
        const sections = newsletters.filter(item => !type || item.code === type).flatMap(getImportableSections)
        const missing = sections
            .filter(section => resolveSectionReport(response?.data ?? [], section.id).status !== 'completed')
            .map(section => section.name)
        return { loading, total: sections.length, loaded: sections.length - missing.length, missing }
    }, [newsletters, type, response, loading])
}

export default useReportsStatus

import { useEffect, useMemo, useState } from 'react'
import { toast } from 'sonner'

import { API_ROUTES } from '@/constants/api'
import useFetchQuery from '@/hooks/useFetchQuery'
import useRequestQuery from '@/hooks/useRequestQuery'
import {
    IReportPreferencesCatalog,
    IReportPreferencesPayload,
    IReportSectionPreference,
} from '@/interfaces/reportPreferences'
import {
    draftFromCatalog,
    draftToEntries,
    positionId,
    reportPreferencesKey,
    ThresholdDraft,
    thresholdsFromCatalog,
    thresholdsToEntries,
    toggleSection,
    toggleSubSection,
} from './utils'

const CATALOG_STALE_TIME_MS = 300_000

/**
 * Catálogo de contenido del boletín + borrador editable.
 *
 * La respuesta se cachea bajo una única queryKey, así que el panel de configuración y
 * el asistente del boletín comparten la misma petición.
 */
export const useReportPreferences = () => {
    const { response, loading } = useFetchQuery<IReportPreferencesCatalog>(API_ROUTES.REPORTS.PREFERENCES, {
        customQueryKey: reportPreferencesKey,
        staleTime: CATALOG_STALE_TIME_MS,
    })

    const catalog = response?.data

    const { request, requestState } = useRequestQuery({
        invalidateQueries: [reportPreferencesKey],
        onSuccess: () => {
            toast.success('Configuración guardada')
        },
    })

    /* Lo persistido, como conjunto de claves ocultas */
    const saved = useMemo(() => draftFromCatalog(catalog), [catalog])
    const [draft, setDraft] = useState<Set<string>>(saved)

    /* Mínimos de puntos por puesto, con el mismo patrón guardado/borrador */
    const savedThresholds = useMemo(() => thresholdsFromCatalog(catalog), [catalog])
    const [thresholds, setThresholds] = useState<ThresholdDraft>(savedThresholds)

    /* Al llegar (o refrescarse) el catálogo, el borrador parte de lo guardado */
    useEffect(() => setDraft(saved), [saved])
    useEffect(() => setThresholds(savedThresholds), [savedThresholds])

    const isDirty = useMemo(() => {
        const hiddenChanged = draft.size !== saved.size || [...draft].some(key => !saved.has(key))
        const savedKeys = Object.keys(savedThresholds)
        const draftKeys = Object.keys(thresholds)
        const thresholdsChanged = savedKeys.length !== draftKeys.length
            || draftKeys.some(key => savedThresholds[key] !== thresholds[key])

        return hiddenChanged || thresholdsChanged
    }, [draft, saved, thresholds, savedThresholds])

    const onToggleSection = (code: string, section: IReportSectionPreference) =>
        setDraft(current => toggleSection(current, code, section))

    const onToggleSubSection = (code: string, section: IReportSectionPreference, subKey: string) =>
        setDraft(current => toggleSubSection(current, code, section, subKey))

    /** Fija (o quita, con null) el mínimo de puntos de un puesto. */
    const onChangeThreshold = (code: string, sectionKey: string, position: string, minPoints: number | null) => {
        const key = positionId(code, sectionKey, position)

        setThresholds(current => {
            const next = { ...current }
            if (minPoints === null) delete next[key]
            else next[key] = minPoints

            return next
        })
    }

    const save = async () => {
        const payload: IReportPreferencesPayload = {
            hidden: draftToEntries(draft),
            thresholds: thresholdsToEntries(catalog, thresholds),
        }
        await request('PUT', API_ROUTES.REPORTS.PREFERENCES, payload)
    }

    /** Vuelve a mostrarlo todo y sin mínimos (queda pendiente de guardar). */
    const reset = () => {
        setDraft(new Set())
        setThresholds({})
    }

    return {
        catalog,
        loading,
        saving: requestState.loading,
        /* Lo guardado: es lo que manda para pintar el wizard */
        saved,
        /* Lo que se está editando en el panel */
        draft,
        thresholds,
        isDirty,
        onToggleSection,
        onToggleSubSection,
        onChangeThreshold,
        save,
        reset,
        discard: () => {
            setDraft(saved)
            setThresholds(savedThresholds)
        },
    }
}

import { create } from 'zustand'

import { useTaskProgressStore } from './task-progress'
import { NationalBackgrounds, NewsletterSectionKeys, UnityBackgrounds } from '@/interfaces/common'
import { INationalMonthlyReport, IUnityMonthlyReport } from '@/interfaces/monthlyReports'
import LayoutPptxRenderer from '@/services/pptx/LayoutPptxRenderer'
import { LayoutPptxPayload } from '@/services/pptx/layoutTypes'
import PptxNationalService from '@/services/pptx/pptxNational'
import { IAuthUser } from '@/interfaces/auth'

type State = {
    unityReportData: IUnityMonthlyReport | null
    templateUnityResources: (UnityBackgrounds & { font_color: string }) | null
    nationalReportData: INationalMonthlyReport | null
    templateNationalResources: (NationalBackgrounds & { font_color: string }) | null
    isExecuting: boolean
}

type Actions = {
    // UNIDAD (horizontal): el backend ya resolvió secciones/datos/paginación; el front
    // solo renderiza el payload de layout. fileName SIN extensión (.pptx la añade el renderer).
    startPptxUnityProcess: (payload: LayoutPptxPayload, fileName: string) => void
    startPptxNationalProcess: (templateResources: NationalBackgrounds & { font_color: string }, nationalReportData: INationalMonthlyReport, authUser: IAuthUser, selectedSections: NewsletterSectionKeys[]) => void
}

const usePptxGeneratorStore = create<State & Actions>((set) => ({
    templateUnityResources: null,
    unityReportData: null,
    templateNationalResources: null,
    nationalReportData: null,
    isExecuting: false,
    startPptxUnityProcess: async (payload, fileName) => {
        set({ isExecuting: true })

        const storeAState = useTaskProgressStore.getState()
        const updateProgress = (text: string) => {
            storeAState.setTaskProgressText(text)
            return new Promise(resolve => setTimeout(resolve, 300))
        }

        try {
            await updateProgress('Generando presentación...')
            // El backend (planUnityPptx) ya entregó la lista ordenada de slides y los
            // layouts del editor; aquí solo se pintan zona por zona con PptxGenJS.
            const renderer = new LayoutPptxRenderer({ fontColor: payload.font_color })
            renderer.build(payload.slides, payload.layouts)

            await updateProgress('Descargando presentación...')
            await renderer.download(fileName)
        } catch (error) {
            console.error('Failed to generate PPTX (layout):', error)
            throw error
        } finally {
            await updateProgress('')
            set({ isExecuting: false })
        }
    },
    startPptxNationalProcess: async (templateResources, nationalReportData, authUser, selectedSections) => {
        set({ templateNationalResources: templateResources, nationalReportData, isExecuting: true })

        const { covers } = templateResources
        const storeAState = useTaskProgressStore.getState()
        const fontColor = templateResources.font_color ? templateResources.font_color.replace('#', '') : 'FFFFFF'

        const pres = new PptxNationalService({ fontColor })

        const updateProgress = (text: string) => {
            storeAState.setTaskProgressText(text)
            return new Promise(resolve => setTimeout(resolve, 500))
        }

        await updateProgress('Generando presentación...')
        pres.slideInit(
            covers.cover_main,
            covers.start_page,
            authUser
        )

        const {
            new_directors,
            diq,
            towards_summit,
            bonds,
            national_ranking,
            national_stars: stars,
            tsr,
            sales_cut,
            national_initiation_cut: initiation_cut,
            target_unit_club,
            tops
        } = nationalReportData

        if (selectedSections.includes(NewsletterSectionKeys.NEW_DIRECTORS)) {
            await updateProgress('Generando Nuevas Directoras y Directoras en calificación...')
            pres.slideNewDirectorsAndDiq(
                templateResources.covers.road_to_success,
                templateResources.bg_sections.diq,
                diq,
                templateResources.bg_sections.new_director,
                new_directors
            )
        }

        if (selectedSections.includes(NewsletterSectionKeys.TOWARDS_SUMMIT)) {
            await updateProgress('Generando Hacia la cumbre...')
            pres.slideTowardsSummit(
                templateResources.covers.road_to_success,
                towards_summit,
                {
                    dir_executive: templateResources.bg_sections.dir_executive,
                    dir_executive_elite: templateResources.bg_sections.dir_executive_elite,
                    dir_senior: templateResources.bg_sections.dir_senior,
                    dir_senior_elite: templateResources.bg_sections.dir_senior_elite,
                }
            )
        }

        if (selectedSections.includes(NewsletterSectionKeys.BONDS)) {
            await updateProgress('Generando Bonos...')
            pres.slideBonds(
                templateResources.covers.bonuses,
                bonds,
                {
                    bonus_24: templateResources.bg_sections.bonus_24,
                    bonus_12: templateResources.bg_sections.bonus_12,
                    bonus_7: templateResources.bg_sections.bonus_7,
                    bonus_5: templateResources.bg_sections.bonus_5,
                    bonus_4: templateResources.bg_sections.bonus_4,
                    bonus_3: templateResources.bg_sections.bonus_3,
                    bonus_2: templateResources.bg_sections.bonus_2,
                }
            )
        }

        if (selectedSections.includes(NewsletterSectionKeys.NATIONAL_RANKING)) {
            await updateProgress('Generando Ranking Nacional...')
            pres.slideNationalRanking(
                templateResources.covers.ranking,
                national_ranking,
                templateResources.bg_sections.top10
            )
        }

        if (selectedSections.includes(NewsletterSectionKeys.NATIONAL_STARS)) {
            await updateProgress('Generando Estrellas...')
            pres.slideStars(
                templateResources.covers.stars,
                stars,
                {
                    diamond_stars: templateResources.bg_sections.diamond_stars,
                    pearl_stars: templateResources.bg_sections.pearl_stars,
                    emerald_stars: templateResources.bg_sections.emerald_stars,
                    ruby_stars: templateResources.bg_sections.ruby_stars,
                    sapphire_stars: templateResources.bg_sections.sapphire_stars,
                }
            )
        }

        if (selectedSections.includes(NewsletterSectionKeys.TOPS)) {
            await updateProgress('Generando Tops...')
            pres.slideTops(
                {
                    top_group_production: templateResources.covers.top_group_production,
                    top_personal_ini: templateResources.covers.top_personal_ini,
                    top_personal_sales: templateResources.covers.top_personal_sales,
                    top_production_unit: templateResources.covers.top_production_unit,
                    top_unit_initiation: templateResources.covers.top_unit_initiation,
                    top_unit_size: templateResources.covers.top_unit_size,
                },
                tops,
                {
                    top1_double: templateResources.bg_sections.top1_double,
                    top1_single: templateResources.bg_sections.top1_single,
                    top2_double: templateResources.bg_sections.top2_double,
                    top2_single: templateResources.bg_sections.top2_single,
                    top3_double: templateResources.bg_sections.top3_double,
                    top3_single: templateResources.bg_sections.top3_single,
                    top_3: templateResources.bg_sections.top_3,
                    top_personal_ini: templateResources.bg_sections.top_personal_ini,
                    top_unit_initiation: templateResources.bg_sections.top_unit_initiation,
                    top_group_production: templateResources.bg_sections.top_group_production,
                    top_production_unit: templateResources.bg_sections.top_production_unit,
                    top_unit_size: templateResources.bg_sections.top_unit_size,
                    top_personal_sales: templateResources.bg_sections.top_personal_sales,
                }
            )
        }

        if (selectedSections.includes(NewsletterSectionKeys.TSR)) {
            await updateProgress('Generando TSR...')
            pres.slideTsr(
                templateResources.covers.tsr,
                tsr,
                {
                    tsr_1: templateResources.bg_sections.tsr_1,
                    tsr_2: templateResources.bg_sections.tsr_2,
                    tsr_target1: templateResources.bg_sections.tsr_target1,
                    tsr_target2: templateResources.bg_sections.tsr_target2,
                }
            )
        }

        if (selectedSections.includes(NewsletterSectionKeys.SALES_CUT) || selectedSections.includes(NewsletterSectionKeys.NATIONAL_INITIATION_CUT) || selectedSections.includes(NewsletterSectionKeys.TARGET_UNIT_CLUB)) {
            await updateProgress('Generando Cortes...')
            pres.slideCuts(
                templateResources.covers.cuts,
                {
                    sales: sales_cut,
                    initiation: initiation_cut,
                    target_unit_club
                },
                {
                    sales_cut: templateResources.bg_sections.sales_cut,
                    initiation_cut: templateResources.bg_sections.initiation_cut,
                    cut_1100: templateResources.bg_sections.cut_1100,
                    cut_750: templateResources.bg_sections.cut_750,
                    cut_450: templateResources.bg_sections.cut_450,
                    cut_600: templateResources.bg_sections.cut_600,
                }
            )
        }

        if (selectedSections.includes(NewsletterSectionKeys.NATIONAL_BIRTHDAYS)) {
            await updateProgress('Generando cumpleaños...')
            pres.slideBirthdays(
                covers.birthdays,
                templateResources.bg_sections.birthdays,
                nationalReportData.national_birthdays
            )
        }

        pres.slideLast(covers.end_page)

        await updateProgress('Descargando presentación...')
        await pres.downloadPptx(`${authUser.account}-Boletín-Nacional-${nationalReportData.year_month}.pptx`)

        await updateProgress('')
    }
}))

export default usePptxGeneratorStore
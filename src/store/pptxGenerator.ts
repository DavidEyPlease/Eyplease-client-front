import { create } from 'zustand'

import { useTaskProgressStore } from './task-progress'
import { NationalBackgrounds, NewsletterSectionKeys, UnityBackgrounds } from '@/interfaces/common'
import { INationalMonthlyReport, IUnityMonthlyReport } from '@/interfaces/monthlyReports'
import PptxUnityService from '@/services/pptx/pptxUnity'
import PptxNationalService from '@/services/pptx/pptxNational'
import { IAuthUser } from '@/interfaces/auth'

type State = {
    unityReportData: IUnityMonthlyReport | null
    templateUnityResources: UnityBackgrounds | null
    nationalReportData: INationalMonthlyReport | null
    templateNationalResources: NationalBackgrounds | null
    isExecuting: boolean
}

type Actions = {
    startPptxUnityProcess: (templateResources: UnityBackgrounds, unityReportData: IUnityMonthlyReport, authUser: IAuthUser, selectedSections: NewsletterSectionKeys[]) => void
    startPptxNationalProcess: (templateResources: NationalBackgrounds, nationalReportData: INationalMonthlyReport, authUser: IAuthUser, selectedSections: NewsletterSectionKeys[]) => void
}

const usePptxGeneratorStore = create<State & Actions>((set) => ({
    templateUnityResources: null,
    unityReportData: null,
    templateNationalResources: null,
    nationalReportData: null,
    isExecuting: false,
    startPptxUnityProcess: async (templateResources, unityReportData, authUser: IAuthUser, selectedSections) => {
        set({ templateUnityResources: templateResources, unityReportData, isExecuting: true })

        const { covers } = templateResources
        const storeAState = useTaskProgressStore.getState()

        const pres = new PptxUnityService()

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

        if (selectedSections.includes(NewsletterSectionKeys.HONOR_ROLL)) {
            await updateProgress('Generando cuadro de honor...')
            pres.slideHonorRoll({
                bgCover: covers.honor_roll,
                bgQueens: templateResources.bg_sections.honor_roll,
                bgFirstPrincess: templateResources.bg_sections.honor_roll2,
                bgSecondPrincess: templateResources.bg_sections.honor_roll3,
                data: unityReportData.honor_roll
            })
        }

        if (selectedSections.includes(NewsletterSectionKeys.INITIATION_CUT)) {
            await updateProgress('Generando corte de iniciación...')
            pres.slideInitiationCut({
                bgCover: covers.initiators,
                bgSlides: templateResources.bg_sections.initiators,
                data: unityReportData.initiation_cut
            })
        }

        if (selectedSections.includes(NewsletterSectionKeys.POINTS_CLUB)) {
            await updateProgress('Generando club de puntos...')
            pres.slidePointsClub({
                bgCover: covers.club_pts,
                honorRollData: unityReportData.honor_roll,
                data: unityReportData.points_club,
                club300: templateResources.bg_sections.club300,
                club600: templateResources.bg_sections.club600,
                club900: templateResources.bg_sections.club900,
                club1200: templateResources.bg_sections.club1200,
                club1500: templateResources.bg_sections.club1500,
                club2000: templateResources.bg_sections.club2000,
                club2500: templateResources.bg_sections.club2500,
                club3000: templateResources.bg_sections.club3000,
            })
        }

        if (selectedSections.includes(NewsletterSectionKeys.ROAD_TO_SUCCESS)) {
            await updateProgress('Generando camino al éxito...')
            pres.slideRoadToSuccess({
                bgCover: covers.road_to_success,
                data: unityReportData.road_to_success,
                road_success_diq: templateResources.bg_sections.road_success_diq,
                road_success_future_director: templateResources.bg_sections.road_success_future_director,
                road_success_target_a_diq: templateResources.bg_sections.road_success_target_a_diq,
                road_success_target_a_fd: templateResources.bg_sections.road_success_target_a_fd,
            })
        }

        if (selectedSections.includes(NewsletterSectionKeys.NEW_BEGGININGS)) {
            await updateProgress('Generando nuevos inicios...')
            pres.slideNewBeginnings({
                bgCover: covers.new_beginnings,
                data: unityReportData.new_beginnings,
                bgSlides: templateResources.bg_sections.new_beginnings,
            })
        }

        if (selectedSections.includes(NewsletterSectionKeys.STARS)) {
            await updateProgress('Generando estrellas...')
            pres.slideStars({
                bgCover: covers.stars,
                data: unityReportData.stars,
                diamond_star: templateResources.bg_sections.diamond_star,
                pearl_star: templateResources.bg_sections.pearl_star,
                emerald_star: templateResources.bg_sections.emerald_star,
                ruby_star: templateResources.bg_sections.ruby_star,
                sapphire_star: templateResources.bg_sections.sapphire_star,
            })
        }

        if (selectedSections.includes(NewsletterSectionKeys.GROUP_PRODUCTION)) {
            await updateProgress('Generando producción de grupo...')
            pres.slideGroupProduction({
                bgCover: covers.luminaires,
                data: unityReportData.group_production,
                diamond_luminaire: templateResources.bg_sections.diamond_luminaire,
                pearl_luminaire: templateResources.bg_sections.pearl_luminaire,
                emerald_luminaire: templateResources.bg_sections.emerald_luminaire,
                ruby_luminaire: templateResources.bg_sections.ruby_luminaire,
                sapphire_luminaire: templateResources.bg_sections.sapphire_luminaire,
            })
        }

        if (selectedSections.includes(NewsletterSectionKeys.PINK_CIRCLES)) {
            await updateProgress('Generando círculo rosa...')
            pres.slidePinkCircle({
                bgCover: covers.pink_circle,
                data: unityReportData.pink_circle,
                bgSections: {
                    pink_circle: templateResources.bg_sections.pink_circle,
                    pink_circle_vip_gold: templateResources.bg_sections.pink_circle_vip_gold,
                    target_pink_circle: templateResources.bg_sections.target_pink_circle,
                    pink_circle_vip: templateResources.bg_sections.pink_circle_vip,
                }
            })
        }

        if (selectedSections.includes(NewsletterSectionKeys.BIRTHDAYS)) {
            await updateProgress('Generando cumpleaños...')
            pres.slideBirthdays(
                covers.birthdays,
                templateResources.bg_sections.birthdays,
                unityReportData.birthdays
            )
        }

        pres.slideLast(covers.end_page)

        await updateProgress('Descargando presentación...')
        await pres.downloadPptx(`${authUser.account}-Boletín-Unidad-${unityReportData.year_month}.pptx`)

        await updateProgress('')
    },
    startPptxNationalProcess: async (templateResources, nationalReportData, authUser, selectedSections) => {
        set({ templateNationalResources: templateResources, nationalReportData, isExecuting: true })

        const { covers } = templateResources
        const storeAState = useTaskProgressStore.getState()

        const pres = new PptxNationalService()

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
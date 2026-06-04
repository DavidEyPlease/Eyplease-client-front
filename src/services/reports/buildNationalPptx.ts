import { IAuthUser } from '@/interfaces/auth'
import { NationalBackgrounds, NewsletterSectionKeys } from '@/interfaces/common'
import { INationalMonthlyReport } from '@/interfaces/monthlyReports'
import PptxNationalService from '@/services/pptx/pptxNational'
import { ReportProgressFn } from './progress'

type NationalResources = NationalBackgrounds & { font_color: string }

// Boletín NACIONAL: a diferencia de Unidad, el front arma la presentación sección
// por sección con PptxNationalService. Aquí se construye la lista de pasos según las
// secciones elegidas para poder reportar un progreso real (cada paso = un tramo del
// porcentaje) y se devuelve el .pptx como Blob para descarga diferida.
export const buildNationalPptx = async (
    templateResources: NationalResources,
    report: INationalMonthlyReport,
    authUser: IAuthUser,
    selectedSections: NewsletterSectionKeys[],
    onProgress: ReportProgressFn
): Promise<Blob> => {
    const { covers, bg_sections } = templateResources
    const fontColor = templateResources.font_color ? templateResources.font_color.replace('#', '') : 'FFFFFF'
    const pres = new PptxNationalService({ fontColor })

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
        tops,
    } = report

    const has = (key: NewsletterSectionKeys) => selectedSections.includes(key)

    // Cada paso pinta una sección. El orden refleja el del boletín final.
    const steps: { label: string; run: () => void }[] = [
        {
            label: 'Generando portada...',
            run: () => pres.slideInit(covers.cover_main, covers.start_page, authUser),
        },
    ]

    if (has(NewsletterSectionKeys.NEW_DIRECTORS)) {
        steps.push({
            label: 'Generando Nuevas Directoras y Directoras en calificación...',
            run: () => pres.slideNewDirectorsAndDiq(
                covers.road_to_success,
                bg_sections.diq,
                diq,
                bg_sections.new_director,
                new_directors
            ),
        })
    }

    if (has(NewsletterSectionKeys.TOWARDS_SUMMIT)) {
        steps.push({
            label: 'Generando Hacia la cumbre...',
            run: () => pres.slideTowardsSummit(
                covers.road_to_success,
                towards_summit,
                {
                    dir_executive: bg_sections.dir_executive,
                    dir_executive_elite: bg_sections.dir_executive_elite,
                    dir_senior: bg_sections.dir_senior,
                    dir_senior_elite: bg_sections.dir_senior_elite,
                }
            ),
        })
    }

    if (has(NewsletterSectionKeys.BONDS)) {
        steps.push({
            label: 'Generando Bonos...',
            run: () => pres.slideBonds(
                covers.bonuses,
                bonds,
                {
                    bonus_24: bg_sections.bonus_24,
                    bonus_12: bg_sections.bonus_12,
                    bonus_7: bg_sections.bonus_7,
                    bonus_5: bg_sections.bonus_5,
                    bonus_4: bg_sections.bonus_4,
                    bonus_3: bg_sections.bonus_3,
                    bonus_2: bg_sections.bonus_2,
                }
            ),
        })
    }

    if (has(NewsletterSectionKeys.NATIONAL_RANKING)) {
        steps.push({
            label: 'Generando Ranking Nacional...',
            run: () => pres.slideNationalRanking(covers.ranking, national_ranking, bg_sections.top10),
        })
    }

    if (has(NewsletterSectionKeys.NATIONAL_STARS)) {
        steps.push({
            label: 'Generando Estrellas...',
            run: () => pres.slideStars(
                covers.stars,
                stars,
                {
                    diamond_stars: bg_sections.diamond_stars,
                    pearl_stars: bg_sections.pearl_stars,
                    emerald_stars: bg_sections.emerald_stars,
                    ruby_stars: bg_sections.ruby_stars,
                    sapphire_stars: bg_sections.sapphire_stars,
                }
            ),
        })
    }

    if (has(NewsletterSectionKeys.TOPS)) {
        steps.push({
            label: 'Generando Tops...',
            run: () => pres.slideTops(
                {
                    top_group_production: covers.top_group_production,
                    top_personal_ini: covers.top_personal_ini,
                    top_personal_sales: covers.top_personal_sales,
                    top_production_unit: covers.top_production_unit,
                    top_unit_initiation: covers.top_unit_initiation,
                    top_unit_size: covers.top_unit_size,
                },
                tops,
                {
                    top1_double: bg_sections.top1_double,
                    top1_single: bg_sections.top1_single,
                    top2_double: bg_sections.top2_double,
                    top2_single: bg_sections.top2_single,
                    top3_double: bg_sections.top3_double,
                    top3_single: bg_sections.top3_single,
                    top_3: bg_sections.top_3,
                    top_personal_ini: bg_sections.top_personal_ini,
                    top_unit_initiation: bg_sections.top_unit_initiation,
                    top_group_production: bg_sections.top_group_production,
                    top_production_unit: bg_sections.top_production_unit,
                    top_unit_size: bg_sections.top_unit_size,
                    top_personal_sales: bg_sections.top_personal_sales,
                }
            ),
        })
    }

    if (has(NewsletterSectionKeys.TSR)) {
        steps.push({
            label: 'Generando TSR...',
            run: () => pres.slideTsr(
                covers.tsr,
                tsr,
                {
                    tsr_1: bg_sections.tsr_1,
                    tsr_2: bg_sections.tsr_2,
                    tsr_target1: bg_sections.tsr_target1,
                    tsr_target2: bg_sections.tsr_target2,
                }
            ),
        })
    }

    if (has(NewsletterSectionKeys.SALES_CUT) || has(NewsletterSectionKeys.NATIONAL_INITIATION_CUT) || has(NewsletterSectionKeys.TARGET_UNIT_CLUB)) {
        steps.push({
            label: 'Generando Cortes...',
            run: () => pres.slideCuts(
                covers.cuts,
                {
                    sales: sales_cut,
                    initiation: initiation_cut,
                    target_unit_club,
                },
                {
                    sales_cut: bg_sections.sales_cut,
                    initiation_cut: bg_sections.initiation_cut,
                    cut_1100: bg_sections.cut_1100,
                    cut_750: bg_sections.cut_750,
                    cut_450: bg_sections.cut_450,
                    cut_600: bg_sections.cut_600,
                }
            ),
        })
    }

    if (has(NewsletterSectionKeys.NATIONAL_BIRTHDAYS)) {
        steps.push({
            label: 'Generando Cumpleaños...',
            run: () => pres.slideBirthdays(covers.birthdays, bg_sections.birthdays, report.national_birthdays),
        })
    }

    steps.push({
        label: 'Cerrando presentación...',
        run: () => pres.slideLast(covers.end_page),
    })

    // El empaquetado (toBlob) ocupa el último 10% del progreso.
    for (let i = 0; i < steps.length; i++) {
        const step = steps[i]
        await onProgress(step.label, Math.round(((i + 1) / steps.length) * 90))
        step.run()
    }

    await onProgress('Empaquetando presentación...', 95)
    return pres.toBlob()
}

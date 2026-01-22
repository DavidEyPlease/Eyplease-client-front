import { IMonthlyReportResponse, SalesCutReport, StarReport, TargetClubReportItem } from "@/interfaces/monthlyReports"
import { divideName } from "@/utils"
import PptxGenJS from "pptxgenjs"
import { BASE_TEXT_STYLE, FONT_SIZES, SLIDE_POSITIONS } from "./baseConfig"
import { formatDate } from "@/utils/dates"

class TextFormatter {
    static formatHonorRollText(item: IMonthlyReportResponse): PptxGenJS.TextProps[] {
        const baseOptions: PptxGenJS.TextPropsOptions = {
            ...BASE_TEXT_STYLE,
            fontSize: FONT_SIZES.honorRoll,
            paraSpaceBefore: 2,
            align: 'center',
            breakLine: true,
            shape: 'rect',
            ...SLIDE_POSITIONS.honorRollText
        }

        return [
            { text: item.sponsored_name, options: baseOptions },
            { text: `${item.report_value} puntos`, options: baseOptions }
        ]
    }

    static formatInitiationCutText(item: IMonthlyReportResponse): PptxGenJS.TextProps[] {
        const { names, surnames } = divideName(item.sponsored_name)
        const baseOptions: PptxGenJS.TextPropsOptions = {
            fontSize: FONT_SIZES.initiationCut,
            paraSpaceBefore: 2,
            align: 'center',
            breakLine: true,
            shape: 'rect',
            ...BASE_TEXT_STYLE,
            ...SLIDE_POSITIONS.initiationCutText
        }

        return [
            { text: names, options: baseOptions },
            { text: surnames, options: baseOptions },
            { text: `${item.report_value} ${item.report_value > 1 ? 'INICIOS' : 'INICIO'}`, options: baseOptions }
        ]
    }

    static formatPointsClubText(item: IMonthlyReportResponse, position: number): PptxGenJS.TextProps[] {
        const textBaseOptions: PptxGenJS.TextPropsOptions = {
            fontSize: FONT_SIZES.pointsClub,
            paraSpaceBefore: 20,
            align: 'left',
            shape: 'rect',
            ...BASE_TEXT_STYLE,
        }

        const { names, surnames } = divideName(item.sponsored_name)
        return [
            {
                text: `${position}. ${names} ${surnames} - ${item.report_value} puntos`,
                options: textBaseOptions
            }
        ]
    }

    static formatRoadToSuccessText(item: IMonthlyReportResponse): PptxGenJS.TextProps[] {
        const textBaseOptions: PptxGenJS.TextPropsOptions = {
            fontSize: FONT_SIZES.roadToSuccess,
            bold: true,
            align: 'center',
            // shape: 'rect',
            ...BASE_TEXT_STYLE,
        }

        const { names, surnames } = divideName(item.sponsored_name)
        return [
            {
                text: `${names} ${surnames}`,
                options: textBaseOptions
            }
        ]
    }

    static formatNewBeginningText(text: string): PptxGenJS.TextProps {
        return {
            text,
            options: {
                ...BASE_TEXT_STYLE,
                breakLine: true,
                fontSize: FONT_SIZES.newBeginning,
                align: 'center',
            }
        }
    }

    static formatStarsText(item: StarReport, fontSize: number = FONT_SIZES.stars): { items: PptxGenJS.TextProps[], options: PptxGenJS.TextPropsOptions } {
        const textBaseOptions: PptxGenJS.TextPropsOptions = {
            fontSize,
            bold: true,
            align: 'left',
            breakLine: true,
            paraSpaceBefore: 8,
            ...BASE_TEXT_STYLE,
        }

        return {
            items: [
                {
                    text: item.sponsored_name,
                    options: textBaseOptions
                },
                {
                    text: item.is_quarter_end ? `Ha ganado con: ${item.points} puntos` : `Lleva: ${item.points} puntos`,
                    options: textBaseOptions
                },
                ...(item.missing_points > 0 ? [{
                    text: `Faltan: ${item.missing_points} puntos`,
                    options: textBaseOptions
                }] : [])
            ],
            options: textBaseOptions
        }
    }

    static formatGroupProductionText(item: IMonthlyReportResponse): PptxGenJS.TextProps[] {
        const textBaseOptions: PptxGenJS.TextPropsOptions = {
            fontSize: FONT_SIZES.stars,
            bold: true,
            align: 'left',
            breakLine: true,
            paraSpaceBefore: 8,
            ...BASE_TEXT_STYLE,
        }

        return [
            {
                text: item.sponsored_name,
                options: textBaseOptions
            },
            {
                text: `${item.report_value} puntos`,
                options: textBaseOptions
            }
        ]
    }

    static formatPinkCircleText(item: IMonthlyReportResponse): PptxGenJS.TextProps {
        return {
            text: `${item.sponsored_name} ${item.report_value} ${item.report_value > 1 ? 'MESES' : 'MES'}`,
            options: {
                ...BASE_TEXT_STYLE,
                bold: true,
                fontSize: FONT_SIZES.body,
                align: 'left',
                paraSpaceAfter: 10,
                breakLine: true,
            }
        }
    }

    static formatBirthdayText(item: IMonthlyReportResponse): PptxGenJS.TextProps {
        return {
            text: `${item.sponsored_name} - ${formatDate(new Date(item.report_value), { formatter: 'D MMMM' })}`,
            options: {
                ...BASE_TEXT_STYLE,
                bold: true,
                fontSize: FONT_SIZES.title,
                align: 'left',
                paraSpaceAfter: 12,
                breakLine: true,
                ...SLIDE_POSITIONS.birthdayText
            }
        }
    }

    static formatNewDiqText(item: IMonthlyReportResponse): PptxGenJS.TextProps {
        const baseOptions: PptxGenJS.TextPropsOptions = {
            ...BASE_TEXT_STYLE,
            fontSize: FONT_SIZES.newDiq,
            align: 'left',
            breakLine: true,
            ...SLIDE_POSITIONS.newDiqText
        }

        return { text: item.sponsored_name, options: baseOptions }
    }

    static formatDiqText(item: IMonthlyReportResponse): PptxGenJS.TextProps {
        const baseOptions: PptxGenJS.TextPropsOptions = {
            ...BASE_TEXT_STYLE,
            fontSize: FONT_SIZES.diq,
            align: 'center',
            breakLine: true,
            ...SLIDE_POSITIONS.diqText
        }

        return { text: item.sponsored_name, options: baseOptions }
    }

    static formatTowardsSummitText(text: string): PptxGenJS.TextProps {
        return {
            text,
            options: {
                ...BASE_TEXT_STYLE,
                breakLine: true,
                fontSize: FONT_SIZES.towardsSummit,
                align: 'center',
            }
        }
    }

    static formatBondsText(text: string): PptxGenJS.TextProps {
        return {
            text,
            options: {
                ...BASE_TEXT_STYLE,
                breakLine: true,
                fontSize: FONT_SIZES.bonds,
                align: 'center',
            }
        }
    }

    static formatNationalRankingText(item: IMonthlyReportResponse): PptxGenJS.TextProps {
        return {
            text: item.sponsored_name,
            options: {
                ...BASE_TEXT_STYLE,
                bold: true,
                fontSize: FONT_SIZES.title,
                align: 'left',
                paraSpaceBefore: 10,
                breakLine: true,
                ...SLIDE_POSITIONS.nationalRanking.remainder
            }
        }
    }

    static formatTsrText(item: IMonthlyReportResponse): PptxGenJS.TextProps {
        const baseOptions: PptxGenJS.TextPropsOptions = {
            ...BASE_TEXT_STYLE,
            fontSize: FONT_SIZES.tsr,
            align: 'center',
            breakLine: true,
            ...SLIDE_POSITIONS.tsr.text
        }

        return { text: item.sponsored_name, options: baseOptions }
    }

    static formatSalesCutText(item: SalesCutReport): { items: PptxGenJS.TextProps[], options: PptxGenJS.TextPropsOptions } {
        const baseOptions: PptxGenJS.TextPropsOptions = {
            ...BASE_TEXT_STYLE,
            fontSize: FONT_SIZES.cuts,
            align: 'center',
            breakLine: true,
            paraSpaceBefore: 10,
            ...SLIDE_POSITIONS.cuts.text
        }

        return {
            items: [
                { text: item.sponsored_name, options: baseOptions },
                { text: `Llevas: ${item.report_value} Puntos`, options: { ...baseOptions, fontSize: 17 } },
                { text: `Faltan: ${item.remaining} Puntos`, options: { ...baseOptions, fontSize: 17 } }
            ],
            options: baseOptions
        }
    }

    static formatNationalInitiationCutText(item: IMonthlyReportResponse): { items: PptxGenJS.TextProps[], options: PptxGenJS.TextPropsOptions } {
        const baseOptions: PptxGenJS.TextPropsOptions = {
            ...BASE_TEXT_STYLE,
            fontSize: FONT_SIZES.cuts,
            align: 'center',
            breakLine: true,
            paraSpaceBefore: 10,
            ...SLIDE_POSITIONS.cuts.text
        }

        return {
            items: [
                { text: item.sponsored_name, options: baseOptions },
                { text: `Calificados: ${item.report_value}`, options: { ...baseOptions, fontSize: 17 } },
            ],
            options: baseOptions
        }
    }

    static formatTargetCutText(item: TargetClubReportItem): { items: PptxGenJS.TextProps[], options: PptxGenJS.TextPropsOptions } {
        const baseOptions: PptxGenJS.TextPropsOptions = {
            ...BASE_TEXT_STYLE,
            fontSize: FONT_SIZES.cuts,
            align: 'center',
            breakLine: true,
            paraSpaceBefore: 10,
            ...SLIDE_POSITIONS.cuts.text
        }

        return {
            items: [
                { text: item.sponsored_name, options: baseOptions },
                { text: `Llevas: ${item.report_value} Puntos`, options: { ...baseOptions, fontSize: 17 } },
                { text: `Faltan: ${item.remaining} Puntos`, options: { ...baseOptions, fontSize: 17 } }
            ],
            options: baseOptions
        }
    }

    static formatRemainingTopsText(item: IMonthlyReportResponse): PptxGenJS.TextProps {
        return {
            text: `${item.sponsored_name} ${item.report_value}`,
            options: {
                ...BASE_TEXT_STYLE,
                bold: true,
                fontSize: FONT_SIZES.title,
                align: 'left',
                paraSpaceBefore: 10,
                breakLine: true,
                ...SLIDE_POSITIONS.tops.remainderText
            }
        }
    }

    static formatTopsThreeText(item: IMonthlyReportResponse, labelPoints: string): { items: PptxGenJS.TextProps[], options: PptxGenJS.TextPropsOptions } {
        const baseTextOptions: PptxGenJS.TextPropsOptions = {
            ...BASE_TEXT_STYLE,
            bold: true,
            align: 'center',
            paraSpaceBefore: 5,
            breakLine: true,
        }

        return {
            items: [
                {
                    text: item.sponsored_name,
                    options: {
                        ...baseTextOptions,
                        fontSize: FONT_SIZES.topsThreeSingle,
                        ...SLIDE_POSITIONS.tops.topThreeSingle.text
                    }
                },
                {
                    text: `${item.report_value} ${labelPoints}`,
                    options: {
                        ...baseTextOptions,
                        fontSize: 18,
                        ...SLIDE_POSITIONS.tops.topThreeSingle.points
                    }
                }
            ],
            options: baseTextOptions
        }
    }

    static formatDoubleTopsThreeText(item: IMonthlyReportResponse, labelPoints: string): { items: PptxGenJS.TextProps[], options: PptxGenJS.TextPropsOptions } {
        const baseTextOptions: PptxGenJS.TextPropsOptions = {
            ...BASE_TEXT_STYLE,
            bold: true,
            align: 'center',
            paraSpaceBefore: 5,
            breakLine: true,
        }

        return {
            items: [
                {
                    text: item.sponsored_name,
                    options: {
                        ...baseTextOptions,
                        fontSize: FONT_SIZES.topsThreeSingle,
                        ...SLIDE_POSITIONS.tops.topThreeSingle.text
                    }
                },
                {
                    text: `${item.report_value} ${labelPoints}`,
                    options: {
                        ...baseTextOptions,
                        fontSize: 18,
                        ...SLIDE_POSITIONS.tops.topThreeSingle.points
                    }
                }
            ],
            options: baseTextOptions
        }
    }
}

export default TextFormatter
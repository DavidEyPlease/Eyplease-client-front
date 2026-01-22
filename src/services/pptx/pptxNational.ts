import PptxGenJS from "pptxgenjs"

import { IAuthUser } from "@/interfaces/auth"
import SlideImageBuilder from "./SlideImageBuilder"
import SlideTextBuilder from "./SlideTextBuilder"
import { FONT_SIZES, SLIDE_POSITIONS } from "./baseConfig"
import { generateBatches, sanitizeFileName } from "@/utils"
import { IMonthlyReportResponse, INationalMonthlyReport, StarReport, TargetClubReportItem } from "@/interfaces/monthlyReports"
import DataValidator from "./DataValidator"
import TextFormatter from "./TextFormatter"
import { PptxBondsBackground, PptxCutsBackgrounds, PptxStarsBackgrounds, PptxTopsBackgrounds, PptxTopsCovers, PptxTowardsSummitBackground, PptxTsrBackgrounds } from "@/interfaces/common"

class PptxNationalService {
    private pres: PptxGenJS

    constructor(private readonly config = { layout: 'LAYOUT_WIDE' as const }) {
        this.pres = new PptxGenJS()
        this.pres.layout = this.config.layout
    }

    slideInit(bgImage: string, bgInitialPhrase: string, authUser: IAuthUser): void {
        this.createProfileSlide(bgImage, authUser)
        this.createMessageSlide(bgInitialPhrase)
    }

    slideNewDirectorsAndDiq(
        bgCover: string,
        bgDiqSection: string,
        diq: IMonthlyReportResponse[],
        bgNewDirectorsSection: string,
        newDirectors: IMonthlyReportResponse[]
    ): void {
        if (DataValidator.hasData(diq) || DataValidator.hasData(newDirectors)) {
            this.createCoverSlide(bgCover)

            this.createNewDiqSlides(bgNewDirectorsSection, newDirectors)
            this.createDiqSlides(bgDiqSection, diq)
        }
    }

    slideTowardsSummit(bgCover: string, data: INationalMonthlyReport['towards_summit'], bgSections: PptxTowardsSummitBackground) {
        if (!DataValidator.hasSomeData(data)) return

        this.createCoverSlide(bgCover)

        const {
            executive_dir_elite,
            executive_dir,
            senior_dir_elite,
            senior_dir,
        } = data

        this.createTowardsSummitSlides(bgSections.dir_senior, senior_dir, 'senior_dir')
        this.createTowardsSummitSlides(bgSections.dir_senior_elite, senior_dir_elite, 'senior_dir_elite')
        this.createTowardsSummitSlides(bgSections.dir_executive, executive_dir, 'executive_dir')
        this.createTowardsSummitSlides(bgSections.dir_executive_elite, executive_dir_elite, 'executive_dir_elite')
    }

    slideBonds(bgCover: string, data: INationalMonthlyReport['bonds'], bgSections: PptxBondsBackground) {
        if (!DataValidator.hasSomeData(data)) return

        this.createCoverSlide(bgCover)

        const {
            b24, b12, b7, b5, b4, b3, b2
        } = data

        this.createBondsSlides(bgSections.bonus_2, b2, 'minors')
        this.createBondsSlides(bgSections.bonus_3, b3, 'minors')
        this.createBondsSlides(bgSections.bonus_4, b4, 'others')
        this.createBondsSlides(bgSections.bonus_5, b5, 'others')
        this.createBondsSlides(bgSections.bonus_7, b7, 'others')
        this.createBondsSlides(bgSections.bonus_12, b12, 'others')
        this.createBondsSlides(bgSections.bonus_24, b24, 'others')
    }

    slideNationalRanking(bgCover: string, data: INationalMonthlyReport['national_ranking'], bgSection: string) {
        if (!DataValidator.hasData(data)) return

        this.createCoverSlide(bgCover)

        const [first, second, third, ...ranking] = data

        this.createNationalRankingSlides(bgSection, ranking)
        this.createNationalRankingTopThreeSlides(bgSection, [first, second, third])
    }

    slideStars(bgCover: string, data: INationalMonthlyReport['national_stars'], bgSections: PptxStarsBackgrounds) {
        console.log('Stars data:', data)
        if (!DataValidator.hasSomeData(data)) {
            console.warn('No valid stars data provided')
            return
        }

        this.createCoverSlide(bgCover)

        const { diamond, pearl, emerald, ruby, sapphire } = data

        this.createStarsSlides(
            bgSections.pearl_stars,
            pearl,
        )
        this.createStarsSlides(
            bgSections.emerald_stars,
            emerald,
        )
        this.createStarsSlides(
            bgSections.diamond_stars,
            diamond,
        )
        this.createStarsSlides(
            bgSections.ruby_stars,
            ruby,
        )
        this.createStarsSlides(
            bgSections.sapphire_stars,
            sapphire,
        )
    }

    slideTops(covers: PptxTopsCovers, data: INationalMonthlyReport['tops'], bgSections: PptxTopsBackgrounds) {
        const { personal_sales, personal_initiation, unit_initiation, group_production, unit_production, unit_size } = data
        const { top_personal_sales, top_personal_ini, top_unit_initiation, top_group_production, top_production_unit, top_unit_size } = covers

        if (DataValidator.hasSomeData(personal_sales)) {
            this.createCoverSlide(top_personal_sales)
            this.createRemainingTopsSlides(bgSections.top_personal_sales, personal_sales.remaining, 'Pts')
            this.createSingleTopThreeSlides(bgSections.top3_single, personal_sales.second_princesses, 'Pts')
            this.createSingleTopThreeSlides(bgSections.top2_single, personal_sales.first_princesses, 'Pts')
            this.createSingleTopThreeSlides(bgSections.top1_single, personal_sales.queens, 'Pts')
        }

        if (DataValidator.hasSomeData(personal_initiation)) {
            this.createCoverSlide(top_personal_ini)
            this.createRemainingTopsSlides(bgSections.top_personal_ini, personal_initiation.remaining, 'inicios')
            this.createDoubleTopThreeSlides(bgSections.top3_double, personal_initiation.second_princesses, 'inicios')
            this.createDoubleTopThreeSlides(bgSections.top2_double, personal_initiation.first_princesses, 'inicios')
            this.createDoubleTopThreeSlides(bgSections.top1_double, personal_initiation.queens, 'inicios')
        }

        if (DataValidator.hasSomeData(unit_initiation)) {
            this.createCoverSlide(top_unit_initiation)
            this.createRemainingTopsSlides(bgSections.top_unit_initiation, unit_initiation.remaining, 'inicios')
            this.createSingleTopThreeSlides(bgSections.top3_single, unit_initiation.second_princesses, 'inicios')
            this.createSingleTopThreeSlides(bgSections.top2_single, unit_initiation.first_princesses, 'inicios')
            this.createSingleTopThreeSlides(bgSections.top1_single, unit_initiation.queens, 'inicios')
        }

        if (DataValidator.hasSomeData(group_production)) {
            this.createCoverSlide(top_group_production)
            this.createRemainingTopsSlides(bgSections.top_group_production, group_production.remaining, 'Pts')
            this.createSingleTopThreeSlides(bgSections.top3_single, group_production.second_princesses, 'Pts')
            this.createSingleTopThreeSlides(bgSections.top2_single, group_production.first_princesses, 'Pts')
            this.createSingleTopThreeSlides(bgSections.top1_single, group_production.queens, 'Pts')
        }

        if (DataValidator.hasSomeData(unit_production)) {
            this.createCoverSlide(top_production_unit)
            this.createRemainingTopsSlides(bgSections.top_production_unit, unit_production.remaining, 'Pts')
            this.createSingleTopThreeSlides(bgSections.top3_single, unit_production.second_princesses, 'Pts')
            this.createSingleTopThreeSlides(bgSections.top2_single, unit_production.first_princesses, 'Pts')
            this.createSingleTopThreeSlides(bgSections.top1_single, unit_production.queens, 'Pts')
        }

        if (DataValidator.hasSomeData(unit_size)) {
            this.createCoverSlide(top_unit_size)
            this.createRemainingTopsSlides(bgSections.top_unit_size, unit_size.remaining, 'consultoras')
            this.createSingleTopThreeSlides(bgSections.top3_single, unit_size.second_princesses, 'consultoras')
            this.createSingleTopThreeSlides(bgSections.top2_single, unit_size.first_princesses, 'consultoras')
            this.createSingleTopThreeSlides(bgSections.top1_single, unit_size.queens, 'consultoras')
        }
    }

    slideTsr(bgCover: string, data: INationalMonthlyReport['tsr'], bgSections: PptxTsrBackgrounds) {
        if (DataValidator.hasSomeData(data)) {
            this.createCoverSlide(bgCover)
            const { winners_1, winners_2, target_1, target_2 } = data
            const { tsr_1, tsr_2, tsr_target1, tsr_target2 } = bgSections

            this.createTsrSlides(tsr_1, winners_1)
            this.createTsrSlides(tsr_2, winners_2)
            this.createTsrSlides(tsr_target1, target_1)
            this.createTsrSlides(tsr_target2, target_2)
        }
    }

    slideCuts(
        bgCover: string,
        data: {
            sales: INationalMonthlyReport['sales_cut'],
            initiation: INationalMonthlyReport['national_initiation_cut'],
            target_unit_club: INationalMonthlyReport['target_unit_club']
        },
        bgSections: PptxCutsBackgrounds
    ) {
        if (DataValidator.hasSomeData({ sales: data.sales, initiation: data.initiation }) || DataValidator.hasSomeData(data.target_unit_club)) {
            this.createCoverSlide(bgCover)
        }
        const { sales_cut, initiation_cut, cut_750, cut_600, cut_450 } = bgSections
        if (DataValidator.hasData(data.sales))
            this.createSalesCutSlides(sales_cut, data.sales)

        if (DataValidator.hasData(data.initiation))
            this.createInitiationCutSlides(initiation_cut, data.initiation)

        if (DataValidator.hasSomeData(data.target_unit_club)) {
            this.createTargetClubCutSlides(cut_750, data.target_unit_club.target_750)
            this.createTargetClubCutSlides(cut_600, data.target_unit_club.target_600)
            this.createTargetClubCutSlides(cut_450, data.target_unit_club.target_450)
        }
    }

    slideBirthdays(
        bgCover: string,
        bgBirthdays: string,
        data: INationalMonthlyReport['national_birthdays']
    ): void {
        if (!DataValidator.hasData(data)) {
            console.warn('No birthday data provided')
            return
        }

        this.createCoverSlide(bgCover)

        const formattedData = data.map(TextFormatter.formatBirthdayText)
        const batches = generateBatches(formattedData, 10)

        batches.forEach(batch => {
            this.createBirthdayBatchSlide(bgBirthdays, batch)
        })
    }

    slideLast(bgImage: string): void {
        this.createCoverSlide(bgImage)
    }

    async downloadPptx(fileName: string): Promise<void> {
        try {
            const sanitizedFileName = sanitizeFileName(fileName)
            await this.pres.writeFile({ fileName: `${sanitizedFileName}.pptx` })
        } catch (error) {
            console.error('Failed to generate PPTX:', error)
            throw new Error(`PPTX generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
        }
    }

    private createCoverSlide(bgImage: string): void {
        const slide = this.pres.addSlide()
        SlideImageBuilder.addBackground(slide, bgImage)
    }

    private createProfileSlide(bgImage: string, authUser: IAuthUser): void {
        const { name, profile_picture } = authUser
        const slide = this.pres.addSlide()

        SlideImageBuilder.addBackground(slide, bgImage)
        SlideImageBuilder.addProfileImage(slide, profile_picture!.url, {
            sizing: {
                type: 'cover',
                x: 0.5, y: 1.1, w: '31%', h: '56%'
            },
            x: 0.45, y: 1.1, w: '31%', h: '56%'
        })

        SlideTextBuilder.addText(slide, name.toUpperCase(), {
            ...SLIDE_POSITIONS.userName,
            fontSize: FONT_SIZES.title
        })
    }

    private createMessageSlide(bgImage: string): void {
        const slide = this.pres.addSlide()
        SlideImageBuilder.addBackground(slide, bgImage)
    }

    private createNewDiqSlides(bgImage: string, diq: IMonthlyReportResponse[]): void {
        diq.forEach(item => {
            const slide = this.pres.addSlide()
            SlideImageBuilder.addBackground(slide, bgImage)
            const imagePosition = SLIDE_POSITIONS.newDiqPhoto
            SlideImageBuilder.addImage(slide, {
                path: item.photo_url,
                sizing: {
                    type: 'cover',
                    ...imagePosition
                },
                ...imagePosition
            })

            const { text, options } = TextFormatter.formatNewDiqText(item)
            slide.addText(text || '', options)
        })
    }

    private createDiqSlides(bgImage: string, diq: IMonthlyReportResponse[]): void {
        diq.forEach(item => {
            const slide = this.pres.addSlide()
            SlideImageBuilder.addBackground(slide, bgImage)
            const imagePosition = SLIDE_POSITIONS.diqPhoto
            SlideImageBuilder.addImage(slide, {
                path: item.photo_url,
                sizing: {
                    type: 'cover',
                    ...imagePosition
                },
                ...imagePosition
            })

            const { text, options } = TextFormatter.formatDiqText(item)
            slide.addText(text || '', options)
        })
    }

    private createTowardsSummitSlides(bgSection: string, data: IMonthlyReportResponse[], sectionKey: keyof INationalMonthlyReport['towards_summit']) {
        if (sectionKey !== 'senior_dir') {
            data.forEach(item => {
                const slide = this.pres.addSlide()
                SlideImageBuilder.addBackground(slide, bgSection)
                const imagePosition = SLIDE_POSITIONS.towardsSummit.photo
                SlideImageBuilder.addImage(slide, {
                    path: item.photo_url,
                    sizing: {
                        type: 'cover',
                        w: imagePosition.w,
                        h: imagePosition.h
                    },
                    ...imagePosition
                })

                const { text, options } = TextFormatter.formatTowardsSummitText(item.sponsored_name)
                slide.addText(text || '', { ...options, ...SLIDE_POSITIONS.towardsSummit.name, fontSize: 30 })
            })
        } else {
            const batches = generateBatches(data, 4)
            batches.forEach((batch) => {
                const slide = this.pres.addSlide()
                SlideImageBuilder.addBackground(slide, bgSection)
                batch.forEach((item, i) => {
                    const personTextPosition = { ...SLIDE_POSITIONS.towardsSummit.seniorDir.name, ...SLIDE_POSITIONS.towardsSummit.seniorDir[`namePosition${i}` as keyof typeof SLIDE_POSITIONS.towardsSummit.seniorDir] }
                    const personTextFormatter = TextFormatter.formatTowardsSummitText(item.sponsored_name)
                    slide.addText(
                        [personTextFormatter],
                        { ...personTextPosition, ...personTextFormatter.options }
                    )

                    const imagePosition = { ...SLIDE_POSITIONS.towardsSummit.seniorDir.photo, ...SLIDE_POSITIONS.towardsSummit.seniorDir[`photoPosition${i}` as keyof typeof SLIDE_POSITIONS.towardsSummit.seniorDir] }
                    SlideImageBuilder.addImage(slide, {
                        path: item.photo_url,
                        sizing: {
                            type: 'cover',
                            ...imagePosition
                        },
                        ...imagePosition
                    })
                })
            })
        }
    }

    private createBondsSlides(bgSection: string, data: IMonthlyReportResponse[], type: 'minors' | 'others') {
        if (type !== 'minors') {
            data.forEach(item => {
                const slide = this.pres.addSlide()
                SlideImageBuilder.addBackground(slide, bgSection)
                const imagePosition = SLIDE_POSITIONS.bonds.photo
                SlideImageBuilder.addImage(slide, {
                    path: item.photo_url,
                    sizing: {
                        type: 'cover',
                        w: imagePosition.w,
                        h: imagePosition.h
                    },
                    ...imagePosition
                })

                const { text, options } = TextFormatter.formatBondsText(item.sponsored_name)
                slide.addText(text || '', { ...options, ...SLIDE_POSITIONS.bonds.name, fontSize: 35 })
            })
        } else {
            const batches = generateBatches(data, 4)
            batches.forEach((batch) => {
                const slide = this.pres.addSlide()
                SlideImageBuilder.addBackground(slide, bgSection)
                batch.forEach((item, i) => {
                    const personTextPosition = { ...SLIDE_POSITIONS.bonds.minors.name, ...SLIDE_POSITIONS.bonds.minors[`namePosition${i}` as keyof typeof SLIDE_POSITIONS.bonds.minors] }
                    const personTextFormatter = TextFormatter.formatBondsText(item.sponsored_name)
                    slide.addText(
                        personTextFormatter.text || '',
                        { ...personTextPosition, ...personTextFormatter.options, fontSize: 16 }
                    )

                    const imagePosition = { ...SLIDE_POSITIONS.bonds.minors.photo, ...SLIDE_POSITIONS.bonds.minors[`photoPosition${i}` as keyof typeof SLIDE_POSITIONS.bonds.minors] }
                    SlideImageBuilder.addImage(slide, {
                        path: item.photo_url,
                        sizing: {
                            type: 'cover',
                            ...imagePosition
                        },
                        ...imagePosition
                    })
                })
            })
        }
    }

    private createNationalRankingSlides(bgSection: string, data: IMonthlyReportResponse[]) {
        const filteredData = data.filter(i => i.report_value >= 10000).toReversed()
        let count = filteredData.length + 3

        const formattedData = filteredData.map(TextFormatter.formatNationalRankingText)
        const batches = generateBatches(formattedData, 10)

        batches.forEach(batch => {
            const slide = this.pres.addSlide()
            SlideImageBuilder.addBackground(slide, bgSection)
            slide.addText(batch.map(i => ({ ...i, text: `${count--}. ${i.text}` })), batch[0].options)
        })
    }

    private createNationalRankingTopThreeSlides(bgSection: string, data: IMonthlyReportResponse[]) {
        const slide = this.pres.addSlide()
        SlideImageBuilder.addBackground(slide, bgSection)

        data.forEach((item, index) => {
            const personTextPosition = SLIDE_POSITIONS.nationalRanking[`topName${index + 1}` as keyof typeof SLIDE_POSITIONS.nationalRanking]
            const personTextFormatter = TextFormatter.formatNationalRankingText(item)
            slide.addText(
                [{ ...personTextFormatter, options: { ...personTextFormatter.options, fontSize: 15 } }],
                { ...personTextFormatter.options, ...personTextPosition }
            )

            const imagePosition = { ...SLIDE_POSITIONS.nationalRanking.topThreePhotoSize, ...SLIDE_POSITIONS.nationalRanking[`topPhoto${index + 1}` as keyof typeof SLIDE_POSITIONS.nationalRanking] }
            SlideImageBuilder.addImage(slide, {
                path: item.photo_url,
                sizing: {
                    type: 'cover',
                    ...imagePosition
                },
                ...imagePosition
            })
        })
    }

    private createStarsSlides(bgSection: string, data: StarReport[]) {
        const batches = generateBatches(data, 4)
        batches.forEach((batch) => {
            const slide = this.pres.addSlide()
            SlideImageBuilder.addBackground(slide, bgSection)
            batch.forEach((item, i) => {
                const personTextPosition = SLIDE_POSITIONS.nationalStars[`namePosition${i}` as keyof typeof SLIDE_POSITIONS.nationalStars]
                const { items, options } = TextFormatter.formatStarsText(item, 13)
                slide.addText(
                    items,
                    { ...personTextPosition, ...options, fontSize: 13 }
                )

                const imagePosition = { ...SLIDE_POSITIONS.nationalStars.photoSize, ...SLIDE_POSITIONS.nationalStars[`photoPosition${i}` as keyof typeof SLIDE_POSITIONS.nationalStars] }
                SlideImageBuilder.addImage(slide, {
                    path: item.photo_url,
                    sizing: {
                        type: 'cover',
                        ...imagePosition
                    },
                    ...imagePosition
                })
            })
        })
    }

    private createRemainingTopsSlides(bgSection: string, data: IMonthlyReportResponse[], labelPoints: string): void {
        const formattedData = data.map((i, index) => {
            const { text, options } = TextFormatter.formatRemainingTopsText(i)
            return { text: `${index + 4}. ${text} ${labelPoints}`, options }
        })
        const batches = generateBatches(formattedData, 10)

        batches.forEach(batch => {
            const slide = this.pres.addSlide()
            SlideImageBuilder.addBackground(slide, bgSection)
            slide.addText(batch, batch[0].options)
        })
    }

    private createSingleTopThreeSlides(bgSection: string, data: IMonthlyReportResponse[], labelPoints: string): void {
        data.forEach(item => {
            const slide = this.pres.addSlide()
            SlideImageBuilder.addBackground(slide, bgSection)
            const imagePosition = SLIDE_POSITIONS.tops.topThreeSingle.photo
            SlideImageBuilder.addImage(slide, {
                path: item.photo_url,
                sizing: {
                    type: 'cover',
                    w: imagePosition.w,
                    h: imagePosition.h
                },
                ...imagePosition
            })

            const { items, options } = TextFormatter.formatTopsThreeText(item, labelPoints)
            slide.addText(items, { ...options, ...SLIDE_POSITIONS.tops.topThreeSingle.text })
        })
    }

    private createDoubleTopThreeSlides(bgSection: string, data: IMonthlyReportResponse[], labelPoints: string): void {
        const batches = generateBatches(data, 2)
        batches.forEach(batch => {
            const slide = this.pres.addSlide()
            SlideImageBuilder.addBackground(slide, bgSection)
            batch.forEach((item, i) => {
                const personTextPosition = SLIDE_POSITIONS.tops.topThreeDouble[`text${i}` as keyof typeof SLIDE_POSITIONS.tops.topThreeDouble]
                const { items, options } = TextFormatter.formatTopsThreeText(item, labelPoints)
                slide.addText(
                    items,
                    { ...options, ...personTextPosition, fontSize: 13 }
                )

                const imagePosition = SLIDE_POSITIONS.tops.topThreeDouble[`photo${i}` as keyof typeof SLIDE_POSITIONS.tops.topThreeDouble]
                SlideImageBuilder.addImage(slide, {
                    path: item.photo_url,
                    sizing: {
                        type: 'cover',
                        ...imagePosition
                    },
                    ...imagePosition
                })
            })
        })
    }

    private createTsrSlides(bgImage: string, tsr: IMonthlyReportResponse[]): void {
        tsr.forEach(item => {
            const slide = this.pres.addSlide()
            SlideImageBuilder.addBackground(slide, bgImage)
            const imagePosition = SLIDE_POSITIONS.tsr.photo
            SlideImageBuilder.addImage(slide, {
                path: item.photo_url,
                sizing: {
                    type: 'cover',
                    ...imagePosition
                },
                ...imagePosition
            })

            const { text, options } = TextFormatter.formatTsrText(item)
            slide.addText(text || '', options)
        })
    }

    private createSalesCutSlides(bgImage: string, data: INationalMonthlyReport['sales_cut']): void {
        data.forEach(item => {
            const slide = this.pres.addSlide()
            SlideImageBuilder.addBackground(slide, bgImage)
            const imagePosition = SLIDE_POSITIONS.cuts.photo
            SlideImageBuilder.addImage(slide, {
                path: item.photo_url,
                sizing: {
                    type: 'cover',
                    ...imagePosition
                },
                ...imagePosition
            })

            const { items, options } = TextFormatter.formatSalesCutText(item)
            slide.addText(items, options)
        })
    }

    private createInitiationCutSlides(bgImage: string, data: INationalMonthlyReport['national_initiation_cut']): void {
        data.forEach(item => {
            const slide = this.pres.addSlide()
            SlideImageBuilder.addBackground(slide, bgImage)
            const imagePosition = SLIDE_POSITIONS.cuts.photo
            SlideImageBuilder.addImage(slide, {
                path: item.photo_url,
                sizing: {
                    type: 'cover',
                    ...imagePosition
                },
                ...imagePosition
            })

            const { items, options } = TextFormatter.formatNationalInitiationCutText(item)
            slide.addText(items, options)
        })
    }

    private createTargetClubCutSlides(bgImage: string, data: TargetClubReportItem[]): void {
        data.forEach(item => {
            const slide = this.pres.addSlide()
            SlideImageBuilder.addBackground(slide, bgImage)
            const imagePosition = SLIDE_POSITIONS.cuts.photo
            SlideImageBuilder.addImage(slide, {
                path: item.photo_url,
                sizing: {
                    type: 'cover',
                    ...imagePosition
                },
                ...imagePosition
            })

            const { items, options } = TextFormatter.formatTargetCutText(item)
            slide.addText(items, options)
        })
    }

    private createBirthdayBatchSlide(
        bgImage: string,
        batch: PptxGenJS.TextProps[]
    ): void {
        const slide = this.pres.addSlide()
        SlideImageBuilder.addBackground(slide, bgImage)
        slide.addText(batch, batch[0].options)
    }
}

export default PptxNationalService
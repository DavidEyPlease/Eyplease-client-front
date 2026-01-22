import PptxGenJS from "pptxgenjs"

import { IAuthUser } from "@/interfaces/auth"
import { IMonthlyReportResponse, IUnityMonthlyReport, StarReport } from "@/interfaces/monthlyReports"
import { generateBatches, sanitizeFileName } from "@/utils"
import SlideImageBuilder from "./SlideImageBuilder"
import SlideTextBuilder from "./SlideTextBuilder"
import DataValidator from "./DataValidator"
import { GroupProductionBackgrounds, HonorRollBackgrounds, PinkCircleBackgrounds, PointsClubBackgrounds, RoadToSuccessBackgrounds, StarsBackgrounds } from "./types"
import { FONT_SIZES, SLIDE_POSITIONS } from "./baseConfig"
import TextFormatter from "./TextFormatter"

class PptxUnityService {
    private pres: PptxGenJS

    constructor(private readonly config = { layout: 'LAYOUT_WIDE' as const }) {
        this.pres = new PptxGenJS()
        this.pres.layout = this.config.layout
    }

    slideInit(bgImage: string, bgInitialPhrase: string, authUser: IAuthUser): void {
        this.createProfileSlide(bgImage, authUser)
        this.createMessageSlide(bgInitialPhrase)
    }

    slideHonorRoll(options: {
        bgCover: string
        data: IUnityMonthlyReport['honor_roll']
    } & HonorRollBackgrounds): void {
        const { bgCover, bgQueens, bgFirstPrincess, bgSecondPrincess, data } = options

        if (!DataValidator.validateHonorRollData(data)) {
            console.warn('No valid honor roll data provided')
            return
        }

        this.createCoverSlide(bgCover)

        const backgrounds = [bgQueens, bgFirstPrincess, bgSecondPrincess]
        data.forEach((item, index) => {
            this.createHonorRollDetailSlide(backgrounds[index], item)
        })
    }

    slideInitiationCut(options: {
        bgCover: string
        bgSlides: string
        data: IUnityMonthlyReport['initiation_cut']
    }): void {
        const { bgCover, bgSlides, data } = options

        if (!DataValidator.validateInitiationCutData(data)) {
            console.warn('No valid initiation cut data provided')
            return
        }

        this.createCoverSlide(bgCover)

        const { queens, first_princesses, second_princesses } = data
        const arrayData = [...queens, ...first_princesses, ...second_princesses]
        arrayData.forEach(item => {
            this.createInitiationCutDetailSlide(bgSlides, item)
        })
    }

    slidePointsClub(options: {
        bgCover: string
        honorRollData: IUnityMonthlyReport['honor_roll']
        data: IUnityMonthlyReport['points_club']
    } & PointsClubBackgrounds) {
        const { bgCover, honorRollData, data } = options
        if (!DataValidator.validatePointsClubData(data)) {
            console.warn('No valid points club data provided')
            return
        }

        const honorRollIds = honorRollData.map(item => item.sponsored_id)

        this.createCoverSlide(bgCover)

        const { club_300, club_600, club_900, club_1000, club_1500, club_2000, club_2500, club_3000 } = data
        const allData = [...club_3000, ...club_2500, ...club_2000, ...club_1500, ...club_1000, ...club_900, ...club_600, ...club_300]

        this.createPointClubDetailSlide(
            options.club3000,
            allData,
            club_3000.filter(i => !honorRollIds.includes(i.sponsored_id))
        )
        this.createPointClubDetailSlide(
            options.club2500,
            allData,
            club_2500.filter(i => !honorRollIds.includes(i.sponsored_id))
        )
        this.createPointClubDetailSlide(
            options.club2000,
            allData,
            club_2000.filter(i => !honorRollIds.includes(i.sponsored_id))
        )
        this.createPointClubDetailSlide(
            options.club1500,
            allData,
            club_1500.filter(i => !honorRollIds.includes(i.sponsored_id))
        )
        this.createPointClubDetailSlide(
            options.club1200,
            allData,
            club_1000.filter(i => !honorRollIds.includes(i.sponsored_id))
        )
        this.createPointClubDetailSlide(
            options.club900,
            allData,
            club_900.filter(i => !honorRollIds.includes(i.sponsored_id))
        )
        this.createPointClubDetailSlide(
            options.club600,
            allData,
            club_600.filter(i => !honorRollIds.includes(i.sponsored_id))
        )

        this.createPointClubDetailSlide(
            options.club300,
            allData,
            club_300.filter(i => !honorRollIds.includes(i.sponsored_id))
        )
    }

    slideRoadToSuccess(options: {
        bgCover: string
        data: IUnityMonthlyReport['road_to_success']
    } & RoadToSuccessBackgrounds) {
        const { bgCover, data, ...bgSections } = options

        if (!DataValidator.validateRoadToSuccessData(data)) {
            console.warn('No valid road to success data provided')
            return
        }

        this.createCoverSlide(bgCover)

        const { diqs, future_director, target_diqs, target_future_director } = data

        this.createRoadToSuccessDetailSlide(
            bgSections.road_success_diq,
            diqs,
        )
        this.createRoadToSuccessDetailSlide(
            bgSections.road_success_diq,
            target_diqs,
        )
        this.createRoadToSuccessDetailSlide(
            bgSections.road_success_diq,
            future_director,
        )
        this.createRoadToSuccessDetailSlide(
            bgSections.road_success_diq,
            target_future_director,
        )
    }

    slideNewBeginnings(
        options: { bgCover: string, data: IUnityMonthlyReport['new_beginnings'], bgSlides: string }
    ) {
        const { bgCover, bgSlides, data } = options

        if (!DataValidator.hasData(data)) {
            console.warn('No valid new beginnings data provided')
            return
        }

        this.createCoverSlide(bgCover)

        this.createNewBeginningsDetailSlide(bgSlides, data)
    }

    slideStars(options: { bgCover: string, data: IUnityMonthlyReport['stars'] } & StarsBackgrounds) {
        const { bgCover, data, ...bgSections } = options

        if (!DataValidator.validateStarsData(data)) {
            console.warn('No valid stars data provided')
            return
        }

        this.createCoverSlide(bgCover)

        const { diamond, pearl, emerald, ruby, sapphire } = data

        this.createStarSlide(
            bgSections.pearl_star,
            pearl,
        )
        this.createStarSlide(
            bgSections.emerald_star,
            emerald,
        )
        this.createStarSlide(
            bgSections.diamond_star,
            diamond,
        )
        this.createStarSlide(
            bgSections.ruby_star,
            ruby,
        )
        this.createStarSlide(
            bgSections.sapphire_star,
            sapphire,
        )
    }

    slideGroupProduction(options: { bgCover: string, data: IUnityMonthlyReport['group_production'] } & GroupProductionBackgrounds) {
        const { bgCover, data, ...bgSections } = options

        if (!DataValidator.validateGroupProductionData(data)) {
            console.warn('No valid group production data provided')
            return
        }

        this.createCoverSlide(bgCover)

        const { l_diamond, l_emerald, l_pearl, l_ruby, l_sapphire } = data

        this.createGroupProductionSlide(bgSections.pearl_luminaire, l_pearl)
        this.createGroupProductionSlide(bgSections.emerald_luminaire, l_emerald)
        this.createGroupProductionSlide(bgSections.diamond_luminaire, l_diamond)
        this.createGroupProductionSlide(bgSections.ruby_luminaire, l_ruby)
        this.createGroupProductionSlide(bgSections.sapphire_luminaire, l_sapphire)
    }

    slidePinkCircle(options: { bgCover: string, data: IUnityMonthlyReport['pink_circle'], bgSections: PinkCircleBackgrounds }) {
        const { bgCover, data, bgSections } = options
        if (!DataValidator.validatePinkCircleData(data)) {
            console.warn('No valid pink circle data provided')
            return
        }

        this.createCoverSlide(bgCover)

        const { target_pink_circle, pink_circle, pink_circle_vip_gold } = bgSections

        this.createPinkCircleSlide(pink_circle_vip_gold, data.gold)
        this.createPinkCircleSlide(pink_circle, data.pink)
        this.createPinkCircleSlide(target_pink_circle, data.pink_target)
    }

    slideBirthdays(
        bgCover: string,
        bgBirthdays: string,
        data: IUnityMonthlyReport['birthdays']
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

    private createProfileSlide(bgImage: string, authUser: IAuthUser): void {
        const { name, profile_picture, client_role } = authUser
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

        if (client_role?.name) {
            SlideTextBuilder.addText(slide, client_role.name.toUpperCase(), {
                ...SLIDE_POSITIONS.userRole,
                fontSize: FONT_SIZES.subtitle
            })
        }
    }

    private createMessageSlide(bgImage: string): void {
        const slide = this.pres.addSlide()
        SlideImageBuilder.addBackground(slide, bgImage)
    }

    private createCoverSlide(bgImage: string): void {
        const slide = this.pres.addSlide()
        SlideImageBuilder.addBackground(slide, bgImage)
    }

    private createHonorRollDetailSlide(
        bgImage: string,
        item: IMonthlyReportResponse
    ): void {
        const slide = this.pres.addSlide()

        SlideImageBuilder.addBackground(slide, bgImage)
        const imagePosition = SLIDE_POSITIONS.honorRollImage
        SlideImageBuilder.addImage(slide, {
            path: item.photo_url,
            sizing: {
                type: 'cover',
                ...imagePosition
            },
            ...imagePosition
        })

        const textContent = TextFormatter.formatHonorRollText(item)
        slide.addText(textContent, textContent[0].options)
    }

    private createInitiationCutDetailSlide(
        bgImage: string,
        item: IMonthlyReportResponse
    ): void {
        const slide = this.pres.addSlide()

        SlideImageBuilder.addBackground(slide, bgImage)
        const imagePosition = SLIDE_POSITIONS.initiationCutImage
        SlideImageBuilder.addImage(slide, {
            path: item.photo_url,
            sizing: {
                type: 'cover',
                ...imagePosition
            },
            ...imagePosition
        })

        const textContent = TextFormatter.formatInitiationCutText(item)
        slide.addText(textContent, textContent[0].options)
    }

    private createPointClubDetailSlide(
        bgSection: string,
        allData: IMonthlyReportResponse[],
        pointsSectionItems: IMonthlyReportResponse[]
    ): void {
        if (pointsSectionItems.length === 0) return
        const content = pointsSectionItems.map(item => {
            const position = allData.findIndex(i => i.sponsored_id === item.sponsored_id) + 1
            return {
                photo: position >= 4 && position <= 10 ? item.photo_url : null,
                text: TextFormatter.formatPointsClubText(item, position)
            }
        })

        const batches = generateBatches(content, 3)

        batches.forEach((batch) => {
            const slide = this.pres.addSlide()

            SlideImageBuilder.addBackground(slide, bgSection)
            batch.forEach((item, i) => {
                if (item.photo) {
                    const imagePosition = SLIDE_POSITIONS.pointsClubPhotos[`person${i}` as keyof typeof SLIDE_POSITIONS.pointsClubPhotos]
                    SlideImageBuilder.addImage(slide, {
                        path: item.photo,
                        sizing: {
                            type: 'cover',
                            ...imagePosition
                        },
                        ...imagePosition
                    })
                }
                slide.addText(item.text, SLIDE_POSITIONS.pointsClubText[`person${i}` as keyof typeof SLIDE_POSITIONS.pointsClubText])
            })
        })
    }

    private createRoadToSuccessDetailSlide(
        bgSection: string,
        pointsSectionItems: IMonthlyReportResponse[]
    ): void {
        if (pointsSectionItems.length === 0) return
        const content = pointsSectionItems.map(item => {
            return {
                photo: item.photo_url,
                text: TextFormatter.formatRoadToSuccessText(item)
            }
        })

        const batches = generateBatches(content, 3)

        batches.forEach((batch) => {
            const slide = this.pres.addSlide()

            SlideImageBuilder.addBackground(slide, bgSection)
            batch.forEach((item, i) => {
                if (item.photo) {
                    const imagePosition = SLIDE_POSITIONS.roadToSuccessPhotos[`person${i}` as keyof typeof SLIDE_POSITIONS.roadToSuccessPhotos]
                    SlideImageBuilder.addImage(slide, {
                        path: item.photo,
                        sizing: {
                            type: 'cover',
                            ...imagePosition
                        },
                        ...imagePosition
                    })
                }
                slide.addText(item.text, SLIDE_POSITIONS.roadToSuccessText[`person${i}` as keyof typeof SLIDE_POSITIONS.roadToSuccessText])
            })
        })
    }

    private createNewBeginningsDetailSlide(bgSection: string, data: IUnityMonthlyReport['new_beginnings']) {
        const batches = generateBatches(data, 4)

        batches.forEach((batch) => {
            const slide = this.pres.addSlide()
            SlideImageBuilder.addBackground(slide, bgSection)
            batch.forEach((item, i) => {
                const personTextPosition = SLIDE_POSITIONS.newBeginningsText[`person${i}` as keyof typeof SLIDE_POSITIONS.newBeginningsText]
                const personTextFormatter = TextFormatter.formatNewBeginningText(item.sponsored_name)
                slide.addText(
                    [personTextFormatter],
                    { ...personTextPosition, ...personTextFormatter.options, shape: 'rect' }
                )

                const initiatorTextPosition = SLIDE_POSITIONS.newBeginningsText[`initiator${i}` as keyof typeof SLIDE_POSITIONS.newBeginningsText]
                const initiatorTextFormatter = TextFormatter.formatNewBeginningText(item.extra_data.nombre_completo_iniciadora)
                slide.addText(
                    [initiatorTextFormatter],
                    { ...initiatorTextPosition, ...initiatorTextFormatter.options, shape: 'rect' }
                )
            })
        })
    }

    private createStarSlide(
        bgSection: string,
        items: StarReport[]
    ): void {
        if (items.length === 0) return
        const content = items.map(item => {
            return {
                photo: item.photo_url,
                text: TextFormatter.formatStarsText(item)
            }
        })

        content.forEach(item => {
            const slide = this.pres.addSlide()
            SlideImageBuilder.addBackground(slide, bgSection)
            if (item.photo) {
                const imagePosition = SLIDE_POSITIONS.starsPhotos
                SlideImageBuilder.addImage(slide, {
                    path: item.photo,
                    sizing: {
                        type: 'cover',
                        ...imagePosition
                    },
                    ...imagePosition
                })
            }
            slide.addText(item.text.items, SLIDE_POSITIONS.starsText)
        })
    }

    private createGroupProductionSlide(
        bgSection: string,
        items: IMonthlyReportResponse[]
    ): void {
        if (items.length === 0) return
        const content = items.map(item => {
            return {
                photo: item.photo_url,
                text: TextFormatter.formatGroupProductionText(item)
            }
        })

        content.forEach(item => {
            const slide = this.pres.addSlide()
            SlideImageBuilder.addBackground(slide, bgSection)
            if (item.photo) {
                const imagePosition = SLIDE_POSITIONS.groupProductionPhotos
                SlideImageBuilder.addImage(slide, {
                    path: item.photo,
                    sizing: {
                        type: 'cover',
                        ...imagePosition
                    },
                    ...imagePosition
                })
            }
            slide.addText(item.text, SLIDE_POSITIONS.groupProductionText)
        })
    }

    private createPinkCircleSlide(bgSection: string, items: IMonthlyReportResponse[]) {
        if (items.length === 0) return
        const content = items.map(item => TextFormatter.formatPinkCircleText(item))
        const batches = generateBatches(content, 10)
        console.log({ batches })
        batches.forEach(batch => {
            const slide = this.pres.addSlide()
            SlideImageBuilder.addBackground(slide, bgSection)
            slide.addText(batch, { shape: 'rect', ...SLIDE_POSITIONS.pinkCircleText })
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

export default PptxUnityService
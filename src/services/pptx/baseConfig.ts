export const BASE_TEXT_STYLE = {
    fontFace: 'Poppins',
    color: 'FFFFFF',
} as const

export const SLIDE_POSITIONS = {
    profileImage: { x: 0.45, y: 1.1, w: '31%', h: '56%' },
    userName: { x: 0.2, y: 6.1, w: '75%' },
    userRole: { x: 0.2, y: 6.4, w: '25%' },
    honorRollImage: { x: 1.6, y: 2.2, w: '28%', h: '50%' },
    honorRollText: { x: 1.2, y: 6.5, w: '35%' },
    initiationCutImage: { x: 1.9, y: 1.1, w: '30%', h: '50%' },
    initiationCutText: { x: 1.4, y: 6, w: '35%' },
    birthdayText: { x: 0.2, y: 1.7, w: '100%', h: 2 },
    pointsClubText: {
        person0: { x: 2, y: 2.6, w: "100%", h: 1 },
        person1: { x: 2, y: 3.9, w: "100%", h: 1 },
        person2: { x: 2, y: 5.4, w: "100%", h: 1 },
        person3: { x: 2, y: 6.7, w: "100%", h: 1 }
    },
    pointsClubPhotos: {
        person0: { x: 0.5, y: 2.5, w: '10%', h: '15%' },
        person1: { x: 0.5, y: 3.8, w: '10%', h: '15%' },
        person2: { x: 0.5, y: 5.3, w: '10%', h: '15%' },
        person3: { x: 0.5, y: 6.6, w: '10%', h: '15%' }
    },
    roadToSuccessPhotos: {
        person0: { x: 1, y: "35%", w: '25%', h: '40%' },
        person1: { x: 4.8, y: "35%", w: '25%', h: '40%' },
        person2: { x: 8.5, y: "35%", w: '25%', h: '40%' },
    },
    roadToSuccessText: {
        person0: { x: 1, y: "80%", w: '25%', h: 1 },
        person1: { x: 4.8, y: "80%", w: '25%', h: 1 },
        person2: { x: 8.5, y: "80%", w: '25%', h: 1 },
    },
    newBeginningsText: {
        person0: { x: 0, y: 1.5, w: "35%", h: 2 },
        initiator0: { x: 3.7, y: 1.5, w: "40%", h: 2 },
        person1: { x: 0, y: 2.5, w: "35%", h: 2 },
        initiator1: { x: 3.7, y: 2.5, w: "40%", h: 2 },
        person2: { x: 0, y: 3.5, w: "35%", h: 2 },
        initiator2: { x: 3.7, y: 3.5, w: "40%", h: 2 },
        person3: { x: 0, y: 4.5, w: "35%", h: 2 },
        initiator3: { x: 3.7, y: 4.5, w: "40%", h: 2 },
    },
    starsPhotos: { x: 0.8, y: 2.5, w: "22%", h: "40%" },
    starsText: { x: 0.7, y: 6, w: "70%", h: 1 },
    groupProductionPhotos: { x: 0.8, y: 2.5, w: "22%", h: "40%" },
    groupProductionText: { x: 0.7, y: 6, w: "70%", h: 1 },
    pinkCircleText: { x: 0.5, y: 2.5, w: "100%", h: 4 },

    // National
    newDiqText: { x: 8, y: 5, w: "70%", h: 1 },
    newDiqPhoto: { x: 8, y: 1.2, w: "30%", h: "50%" },
    diqText: { x: 8, y: 5, w: "30%", h: 1 },
    diqPhoto: { x: 8, y: 1.2, w: "30%", h: "50%" },
    towardsSummit: {
        photo: { x: 7.1, y: 1.1, w: "30%", h: "55%" },
        name: { x: 7.1, y: 5.8, w: "30%" },
        seniorDir: {
            photo: { w: "20%", h: "30%" },
            name: { w: "25%" },
            photoPosition0: { x: 6.1, y: 0.5 },
            photoPosition1: { x: 10, y: 0.5 },
            photoPosition2: { x: 6.1, y: 4 },
            photoPosition3: { x: 10, y: 4 },
            namePosition0: { x: 5.7, y: 3 },
            namePosition1: { x: 9.7, y: 3 },
            namePosition2: { x: 5.7, y: 6.5 },
            namePosition3: { x: 9.7, y: 6.5 }
        }
    },
    bonds: {
        photo: { x: 7.1, y: 1.1, w: "30%", h: "55%" },
        name: { x: 7.1, y: 6, w: "30%" },
        minors: {
            photo: { w: "20%", h: "30%" },
            name: { w: "25%" },
            photoPosition0: { x: 6.1, y: 0.5 },
            photoPosition1: { x: 10, y: 0.5 },
            photoPosition2: { x: 6.1, y: 4 },
            photoPosition3: { x: 10, y: 4 },
            namePosition0: { x: 5.7, y: 3.2 },
            namePosition1: { x: 9.7, y: 3.2 },
            namePosition2: { x: 5.7, y: 6.7 },
            namePosition3: { x: 9.7, y: 6.7 }
        }
    },
    nationalRanking: {
        remainder: { x: 0.5, y: 4, w: "100%", h: 1 },
        topName1: { x: 1, y: 4.8 },
        topName2: { x: 5, y: 5.4 },
        topName3: { x: 8.6, y: 6.3 },
        topThreePhotoSize: { w: "20%", h: "36%" },
        topPhoto1: { x: 1.3, y: 1.4 },
        topPhoto2: { x: 5.3, y: 2.6 },
        topPhoto3: { x: 8.8, y: 3.1 }
    },
    nationalStars: {
        photoSize: { w: "20%", h: "30%" },
        photoPosition0: { x: 1, y: 0.5 },
        photoPosition1: { x: 5, y: 0.5 },
        photoPosition2: { x: 1, y: 4 },
        photoPosition3: { x: 5, y: 4 },
        namePosition0: { x: 1, y: 3.2 },
        namePosition1: { x: 5, y: 3.2 },
        namePosition2: { x: 1, y: 6.7 },
        namePosition3: { x: 5, y: 6.7 }
    },
    tsr: {
        photo: { x: 1.2, y: 2, w: "35%", h: "55%" },
        text: { x: 1.5, y: 6.2, w: "30%", h: 1 }
    },
    cuts: {
        text: { x: 8, y: 5.5, w: "30%", h: 1 },
        photo: { x: 8, y: 1.2, w: "30%", h: "50%" },
    },
    tops: {
        remainderText: { x: 0.5, y: 4.5, w: "100%", h: 1 },
        topThreeSingle: {
            photo: { x: 1.6, y: 1.4, w: "30%", h: "50%" },
            text: { x: 1.2, y: 6.4, w: "35%", h: 1 },
            points: { x: 1.2, y: 6.7, w: "35%", h: 1 }
        },
        topThreeDouble: {
            photo0: { x: 1.2, y: 2, w: "25%", h: "45%" },
            text0: { x: 0.4, y: 6.3, w: "35%", h: 1 },
            points0: { x: 0.3, y: 6.6, w: "35%", h: 1 },
            photo1: { x: 6, y: 2, w: "25%", h: "45%" },
            text1: { x: 5.5, y: 6.3, w: "35%", h: 1 },
            points1: { x: 5.5, y: 6.6, w: "35%", h: 1 }
        }
    }
} as const

export const FONT_SIZES = {
    title: 22,
    subtitle: 14,
    body: 20,
    honorRoll: 20,
    initiationCut: 17,
    pointsClub: 28,
    roadToSuccess: 25,
    newBeginning: 17,
    stars: 29,

    // National
    newDiq: 25,
    diq: 22,
    towardsSummit: 13,
    bonds: 32,
    nationalRanking: 25,
    tsr: 25,
    cuts: 22,
    topsThreeSingle: 18
} as const

export const SLIDE_BACKGROUNDS = {
    honorRoll: ['queens', 'firstPrincess', 'secondPrincess'] as const,
} as const


export type SlidePosition = typeof SLIDE_POSITIONS[keyof typeof SLIDE_POSITIONS]
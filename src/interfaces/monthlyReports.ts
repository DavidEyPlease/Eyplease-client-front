export type InitiationCutReport = {
    queens: Array<IMonthlyReportResponse>
    first_princesses: Array<IMonthlyReportResponse>
    second_princesses: Array<IMonthlyReportResponse>
}

export type PointsClubReport = {
    club_300: Array<IMonthlyReportResponse>
    club_600: Array<IMonthlyReportResponse>
    club_900: Array<IMonthlyReportResponse>
    club_1000: Array<IMonthlyReportResponse>
    club_1500: Array<IMonthlyReportResponse>
    club_2000: Array<IMonthlyReportResponse>
    club_2500: Array<IMonthlyReportResponse>
    club_3000: Array<IMonthlyReportResponse>
}

export type RoadToSuccessReport = {
    diqs: Array<IMonthlyReportResponse>
    future_director: Array<IMonthlyReportResponse>
    target_diqs: Array<IMonthlyReportResponse>
    target_future_director: Array<IMonthlyReportResponse>
}

export type NewBeginningsReport = IMonthlyReportResponse<{ nombre_completo_iniciadora: string }>

export type StarReport = IMonthlyReportResponse & { missing_points: number, points: number, is_quarter_end: boolean }

export type StarsReport = {
    diamond: Array<StarReport>
    emerald: Array<StarReport>
    pearl: Array<StarReport>
    ruby: Array<StarReport>
    sapphire: Array<StarReport>
}

export type GroupProductionReport = {
    l_diamond: Array<IMonthlyReportResponse>
    l_emerald: Array<IMonthlyReportResponse>
    l_pearl: Array<IMonthlyReportResponse>
    l_ruby: Array<IMonthlyReportResponse>
    l_sapphire: Array<IMonthlyReportResponse>
}

export type PinkCircleReport = {
    gold: Array<IMonthlyReportResponse>
    pink: Array<IMonthlyReportResponse>
    pink_target: Array<IMonthlyReportResponse>
    vip: Array<IMonthlyReportResponse>
}

export interface IUnityMonthlyReport {
    year_month: string
    honor_roll: Array<IMonthlyReportResponse>
    birthdays: Array<IMonthlyReportResponse>
    initiation_cut: InitiationCutReport
    new_beginnings: NewBeginningsReport[]
    pink_circle: PinkCircleReport
    road_to_success: RoadToSuccessReport
    group_production: GroupProductionReport
    points_club: PointsClubReport
    stars: StarsReport
}

export type TowardsSummitReport = {
    executive_dir_elite: Array<IMonthlyReportResponse>
    executive_dir: Array<IMonthlyReportResponse>
    senior_dir_elite: Array<IMonthlyReportResponse>
    senior_dir: Array<IMonthlyReportResponse>
    dir: Array<IMonthlyReportResponse>
}

export type BondsReport = {
    b24: Array<IMonthlyReportResponse>
    b12: Array<IMonthlyReportResponse>
    b7: Array<IMonthlyReportResponse>
    b5: Array<IMonthlyReportResponse>
    b4: Array<IMonthlyReportResponse>
    b3: Array<IMonthlyReportResponse>
    b2: Array<IMonthlyReportResponse>
}

export type TsrReport = {
    winners_1: IMonthlyReportResponse[]
    winners_2: IMonthlyReportResponse[]
    target_1: IMonthlyReportResponse[]
    target_2: IMonthlyReportResponse[]
}

export type SalesCutReport = IMonthlyReportResponse & { remaining: number }

export type TargetClubReportItem = IMonthlyReportResponse & { remaining: number }
export type TargetClubReport = {
    target_750: TargetClubReportItem[]
    target_600: TargetClubReportItem[]
    target_450: TargetClubReportItem[]
}

type TopReporItems = {
    queens: IMonthlyReportResponse[]
    first_princesses: IMonthlyReportResponse[]
    second_princesses: IMonthlyReportResponse[]
    remaining: IMonthlyReportResponse[]
}
export type TopsReport = {
    personal_sales: TopReporItems
    personal_initiation: TopReporItems
    unit_initiation: TopReporItems
    unit_production: TopReporItems
    unit_size: TopReporItems
    group_production: TopReporItems
}

export interface INationalMonthlyReport {
    year_month: string
    new_directors: IMonthlyReportResponse[]
    diq: IMonthlyReportResponse[]
    towards_summit: TowardsSummitReport
    bonds: BondsReport
    national_ranking: IMonthlyReportResponse[]
    national_stars: StarsReport
    tops: TopsReport
    tsr: TsrReport
    sales_cut: SalesCutReport[]
    national_initiation_cut: IMonthlyReportResponse[]
    target_unit_club: TargetClubReport
    national_birthdays: IMonthlyReportResponse[]
}

export interface IMonthlyReportResponse<T = Record<string, unknown>> {
    id: string
    sponsor_id: string
    sponsor_name: string
    report_date: string
    consultant_code: string
    photo_url: string
    sponsored_id: string
    sponsored_name: string
    report_key_value: string
    report_value: number
    extra_data: T
}
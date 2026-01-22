import { IBaseDBProperties, Newsletter, NewsletterSection } from "./common"

export interface IReportUpload extends IBaseDBProperties {
    status: 'processing' | 'completed' | 'failed'
    year_month: string
    error_message?: string
    newsletter: Newsletter
    newsletter_section: NewsletterSection
}
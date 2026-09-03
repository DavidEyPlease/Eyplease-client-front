import { useState } from "react"
import { useSearchParams } from "react-router"

import useBillingAccess from "@/components/billing/useBillingAccess"
import useAuth from "@/hooks/useAuth"
import Billing from "./components/Billing"
import ChangePassword from "./components/ChangePassword"
import Faqs from "./components/Faq"
import FormEditProfile from "./components/FormEditProfile"
import IdentityCard from "./components/IdentityCard"
import Preferences from "./components/Preferences"
import ReportContent from "./components/ReportContent"
import SectionNav from "./components/SectionNav"
import { isProfileSectionKey, ProfileSectionKey } from "./utils"

const ProfilePage = () => {
    const [searchParams] = useSearchParams()
    /* Los avisos de pago enlazan directo a la ficha de facturación */
    const requested = searchParams.get('section')
    const [section, setSection] = useState<ProfileSectionKey>(isProfileSectionKey(requested) ? requested : 'personal')
    const { user } = useAuth()
    const { canSeeBilling } = useBillingAccess()

    if (!user) return null

    return (
        <div className="grid items-start gap-4 pt-2 lg:grid-cols-[300px_minmax(0,1fr)]">
            <div className="flex flex-col gap-4 lg:sticky lg:top-4">
                <IdentityCard user={user} />
                <SectionNav active={section} onChange={setSection} />
            </div>

            <div>
                {section === 'personal' && <FormEditProfile user={user} />}
                {section === 'reports' && <ReportContent />}
                {section === 'billing' && canSeeBilling && <Billing />}
                {section === 'preferences' && <Preferences user={user} />}
                {section === 'security' && <ChangePassword />}
                {section === 'help' && <Faqs />}
            </div>
        </div>
    )
}

export default ProfilePage

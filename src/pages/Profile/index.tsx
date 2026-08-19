import { useState } from "react"

import useAuth from "@/hooks/useAuth"
import ChangePassword from "./components/ChangePassword"
import Faqs from "./components/Faq"
import FormEditProfile from "./components/FormEditProfile"
import IdentityCard from "./components/IdentityCard"
import Preferences from "./components/Preferences"
import ReportContent from "./components/ReportContent"
import SectionNav, { ProfileSectionKey } from "./components/SectionNav"

const ProfilePage = () => {
    const [section, setSection] = useState<ProfileSectionKey>('personal')
    const { user } = useAuth()

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
                {section === 'preferences' && <Preferences user={user} />}
                {section === 'security' && <ChangePassword />}
                {section === 'help' && <Faqs />}
            </div>
        </div>
    )
}

export default ProfilePage

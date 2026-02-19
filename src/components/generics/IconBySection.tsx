import { PermissionKeys } from '@/interfaces/permissions'
import { UsersIcon, CrownIcon, StarIcon, AwardIcon, HeartIcon, CakeIcon, SparkleIcon, TargetIcon, CalendarIcon, GraduationCapIcon, TrendingUpIcon, RocketIcon, TrophyIcon, UserStarIcon } from 'lucide-react'

interface Props {
    sectionKey: PermissionKeys
}

export const IconBySection = ({ sectionKey }: Props) => {
    const ICONS_BY_SECTION = {
        [PermissionKeys.POSTS_UNITY]: UsersIcon,
        [PermissionKeys.POSTS_DIRECTORS]: CrownIcon,
        [PermissionKeys.POSTS_CLIENTS]: UserStarIcon,
        [PermissionKeys.STARS]: StarIcon,
        [PermissionKeys.NATIONAL_STARS]: StarIcon,
        [PermissionKeys.HONOR_ROLL]: AwardIcon,
        [PermissionKeys.PINK_CIRCLE]: HeartIcon,
        [PermissionKeys.BIRTHDAYS]: CakeIcon,
        [PermissionKeys.NATIONAL_BIRTHDAYS]: CakeIcon,
        [PermissionKeys.CUSTOMER_BIRTHDAYS]: CakeIcon,
        [PermissionKeys.NEW_BEGGININGS]: SparkleIcon,
        [PermissionKeys.ROAD_TO_SUCCESS]: TargetIcon,
        [PermissionKeys.ANNIVERSARIES]: CalendarIcon,
        [PermissionKeys.NATIONAL_ANNIVERSARIES]: CalendarIcon,
        [PermissionKeys.DIQ]: GraduationCapIcon,
        [PermissionKeys.SALES_CUT]: TrendingUpIcon,
        [PermissionKeys.INITIATION_CUT]: RocketIcon,
        [PermissionKeys.UNIT_CLUB]: TrophyIcon
    }

    const Icon = ICONS_BY_SECTION[sectionKey as keyof typeof ICONS_BY_SECTION]
    return Icon ? <Icon /> : null
}
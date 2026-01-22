import { IconGallery } from '@/components/Svg/IconGallery'
import { IconMyClients } from '@/components/Svg/IconMyClients'
import { IconTools } from '@/components/Svg/IconTools'
import { IconTraining } from '@/components/Svg/IconTraining'
import { IconReports } from '@/components/Svg/IconReports'
import { IconHome } from '@/components/Svg/IconHome'
import { IconServices } from '@/components/Svg/IconServices'
import { IconPosts } from '@/components/Svg/IconPosts'

export const ICONS: { [key: string]: React.FC } = {
    'home': IconHome,
    'services': IconServices,
    'gallery': IconGallery,
    'posts': IconPosts,
    'myClients': IconMyClients,
    'tools': IconTools,
    'training': IconTraining,
    'reports': IconReports,
}

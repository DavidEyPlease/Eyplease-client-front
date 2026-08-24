import PersonPhotoUploader from '@/components/generics/PersonPhoto'
import { ISponsored } from '@/interfaces/sponsored'
import useSponsoredActions from '../hooks/useSponsoredActions'

interface Props {
    itemId: string
    itemAccount: string
    src: string
    uri: string | null
    alt: string
    sizeClasses?: string
}

const SponsoredPhoto = ({ itemId, src, uri, alt, sizeClasses }: Props) => {
    const { updateCachedVendor } = useSponsoredActions()

    return (
        <PersonPhotoUploader
            personType="sponsored"
            personId={itemId}
            src={src}
            uri={uri}
            alt={alt}
            sizeClasses={sizeClasses}
            onUploaded={updated => updateCachedVendor(itemId, updated as ISponsored)}
        />
    )
}

export default SponsoredPhoto

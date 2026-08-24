import PersonPhotoUploader from '@/components/generics/PersonPhoto'
import { BROWSER_EVENTS } from '@/constants/app'
import { CustomerOfClient } from '@/interfaces/customerOfClients'
import { publishEvent } from '@/utils/events'
import useCustomerActions from '../hooks/useCustomerActions'

interface Props {
    itemId: string
    src: string
    uri: string | null
    alt: string
    sizeClasses?: string
}

const Photo = ({ itemId, src, uri, alt, sizeClasses }: Props) => {
    const { updateCachedCustomer } = useCustomerActions()

    return (
        <PersonPhotoUploader
            personType="customer"
            personId={itemId}
            src={src}
            uri={uri}
            alt={alt}
            sizeClasses={sizeClasses}
            onUploaded={updated => {
                updateCachedCustomer(itemId, updated as CustomerOfClient)
                /* Limpia el input para poder volver a elegir el mismo archivo */
                publishEvent(BROWSER_EVENTS.CLEAR_FILE_UPLOADER, true)
            }}
        />
    )
}

export default Photo

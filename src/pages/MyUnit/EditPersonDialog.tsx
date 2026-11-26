import { useQuery, useQueryClient } from '@tanstack/react-query'

import Modal from '@/components/common/Modal'
import Spinner from '@/components/common/Spinner'
import { API_ROUTES } from '@/constants/api'
import { UNIT_INVITATIONS_KEY } from '@/hooks/useUnitInvitations'
import { ApiResponse, Gender } from '@/interfaces/common'
import { IPost } from '@/interfaces/posts'
import { ISponsored } from '@/interfaces/sponsored'
import VendorForm from '@/pages/Gallery/components/VendorForm'
import { HOY_POSTS_KEY } from '@/pages/Hoy/hooks/useSectionPosts'
import HttpService from '@/services/http'
import { queryKeys } from '@/utils/cache'
import { useCompany } from '@/utils/company'

/** Lo único que se usa aquí del directorio de la unidad (GET /unit/people trae mucho más) */
interface UnitPerson {
    id: string
    gender: Gender | null
}

const UNIT_PEOPLE_KEY = ['unit', 'people']

interface Props {
    /** La consultora abierta en Mi unidad: su id es el de la persona del padrón, el mismo que pide PUT /sponsored/{id} */
    person: { id: string, name: string } | null
    open: boolean
    onOpenChange: (open: boolean) => void
}

/**
 * «Editar su nombre y sexo» desde Mi unidad: la Directora corrige cómo se llama una consultora (p. ej. quitarle un
 * primer nombre que no usa) sin escribirnos. Es el mismo formulario de Galería; lo que cambia es qué se refresca.
 */
const EditPersonDialog = ({ person, open, onOpenChange }: Props) => {
    const queryClient = useQueryClient()
    const { can, t } = useCompany()

    /* Las publicaciones no traen el sexo: sale del directorio de la unidad. Si no está ahí (alguien del Área) o falla,
       el selector arranca vacío y, sin elegir, se queda el que tenga */
    const people = useQuery({
        queryKey: UNIT_PEOPLE_KEY,
        queryFn: async () => (await HttpService.get<ApiResponse<{ people: UnitPerson[] }>>(API_ROUTES.UNIT.PEOPLE)).data?.people ?? [],
        enabled: open && !!person,
        staleTime: 5 * 60 * 1000,
        retry: false,
    })
    const gender = people.data?.find(item => item.id === person?.id)?.gender ?? null

    const onSaved = (updated: Partial<ISponsored>) => {
        if (!person) return
        const name = updated.name || person.name

        /* Mi unidad (y el Hoy) arman a cada consultora con las publicaciones: se le pone el nombre nuevo a las suyas */
        queryClient.setQueriesData<IPost[]>({ queryKey: HOY_POSTS_KEY }, current =>
            current?.map(post => post.vendorable?.id === person.id ? { ...post, vendorable: { ...post.vendorable, name } } : post),
        )
        queryClient.setQueryData<UnitPerson[]>(UNIT_PEOPLE_KEY, current =>
            current?.map(item => item.id === person.id ? { ...item, gender: updated.gender ?? item.gender } : item),
        )
        /* Las demás listas donde sale su nombre se vuelven a pedir la próxima vez que se vean */
        queryClient.invalidateQueries({ queryKey: UNIT_INVITATIONS_KEY })
        queryClient.invalidateQueries({ queryKey: queryKeys.entity('gallery') })

        onOpenChange(false)
    }

    return (
        <Modal
            open={open && !!person}
            onOpenChange={onOpenChange}
            title="Editar su nombre y sexo"
            description={can('regenerate')
                ? `Así aparece en tu ${t('group')} y en sus piezas nuevas. Las que ya están hechas cambian si les das «Rehacer».`
                : `Así aparece en tu ${t('group')}.`}
        >
            {person && (people.isLoading
                ? <Spinner size="md" color="primary" className="py-10" />
                : <VendorForm key={person.id} sponsored={{ id: person.id, name: person.name, gender }} onSuccess={onSaved} />)}
        </Modal>
    )
}

export default EditPersonDialog

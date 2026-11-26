import { useQueryClient } from '@tanstack/react-query'

import Modal from '@/components/common/Modal'
import Spinner from '@/components/common/Spinner'
import { UNIT_INVITATIONS_KEY } from '@/hooks/useUnitInvitations'
import { IPost } from '@/interfaces/posts'
import { ISponsored } from '@/interfaces/sponsored'
import VendorForm from '@/pages/Gallery/components/VendorForm'
import { HOY_POSTS_KEY } from '@/pages/Hoy/hooks/useSectionPosts'
import { queryKeys } from '@/utils/cache'
import { useCompany } from '@/utils/company'
import useUnitPeople, { patchUnitPerson } from './useUnitPeople'

interface Props {
    /** La consultora abierta en Mi unidad: su id es el de la persona del padrón, el mismo que pide PUT /sponsored/{id} */
    person: { id: string, name: string } | null
    open: boolean
    onOpenChange: (open: boolean) => void
}

/**
 * «Editar su apodo, nombre y sexo» desde Mi unidad: la Directora le pone su apodo (sólo para su seguimiento) o corrige
 * cómo se llama una consultora (p. ej. quitarle un primer nombre que no usa) sin escribirnos. Es el mismo formulario
 * de Galería; lo que cambia es qué se refresca.
 */
const EditPersonDialog = ({ person, open, onOpenChange }: Props) => {
    const queryClient = useQueryClient()
    const { can, t } = useCompany()

    /* Las publicaciones no traen el sexo ni el apodo: salen del directorio de la unidad. Si no está ahí (alguien del
       Área) o falla, arrancan vacíos y, sin tocarlos, se quedan los que tenga */
    const people = useUnitPeople(open && !!person)
    const found = people.data?.find(item => item.id === person?.id)
    const gender = found?.gender ?? null
    /* Sin dato (undefined) el formulario no lo borra al guardar en blanco */
    const nickname = found ? (found.nickname ?? null) : undefined

    const onSaved = (updated: Partial<ISponsored>) => {
        if (!person) return
        const name = updated.name || person.name

        /* Mi unidad (y el Hoy) arman a cada consultora con las publicaciones: se le pone el nombre nuevo a las suyas */
        queryClient.setQueriesData<IPost[]>({ queryKey: HOY_POSTS_KEY }, current =>
            current?.map(post => post.vendorable?.id === person.id ? { ...post, vendorable: { ...post.vendorable, name } } : post),
        )
        /* Su sexo y su apodo, en el directorio: Mi unidad la enseña con su apodo al instante */
        patchUnitPerson(queryClient, person.id, updated)
        /* Las demás listas donde sale su nombre se vuelven a pedir la próxima vez que se vean */
        queryClient.invalidateQueries({ queryKey: UNIT_INVITATIONS_KEY })
        queryClient.invalidateQueries({ queryKey: queryKeys.entity('gallery') })

        onOpenChange(false)
    }

    return (
        <Modal
            open={open && !!person}
            onOpenChange={onOpenChange}
            title="Editar su apodo, nombre y sexo"
            description={can('regenerate')
                ? `Su nombre completo es el de sus piezas nuevas; las que ya están hechas cambian si les das «Rehacer».`
                : `Así aparece en tu ${t('group')}.`}
        >
            {person && (people.isLoading
                ? <Spinner size="md" color="primary" className="py-10" />
                : <VendorForm key={person.id} sponsored={{ id: person.id, name: person.name, gender, nickname }} onSuccess={onSaved} />)}
        </Modal>
    )
}

export default EditPersonDialog

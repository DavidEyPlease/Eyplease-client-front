import {
    ToggleGroup,
    ToggleGroupItem,
} from "@/components/ui/toggle-group"

import Button from "@/components/common/Button"
import TextInput from "@/components/common/Inputs/TextInput"
import { Label } from "@/components/ui/label"
import useCustomForm from "@/hooks/useCustomForm"
import { SponsoredFormData, SponsoredSchema } from "./schema"
import { ISponsored } from "@/interfaces/sponsored"
import { Gender } from "@/interfaces/common"
import { API_ROUTES } from "@/constants/api"
import { toast } from "sonner"
import useRequestQuery from "@/hooks/useRequestQuery"
import { useCompany } from "@/utils/company"

/** Lo mínimo para editar a una persona: Galería pasa su vendedora entera y Mi unidad sólo esto. */
export interface VendorFormPerson {
    id: string
    name: string
    /** Sin dato (null o ausente), el selector arranca vacío y no se manda: se queda el que tiene */
    gender?: Gender | null
    /** Su apodo (sólo de esta Directora). Sin dato (ausente) el campo arranca vacío y sólo se manda si escribe uno */
    nickname?: string | null
}

interface Props {
    sponsored: VendorFormPerson
    /** Con lo guardado (lo que contestó la API sobre lo que se mandó), para que quien abrió el formulario refresque su lista */
    onSuccess?: (updated: Partial<ISponsored>) => void
}

const VendorForm = ({ sponsored, onSuccess }: Props) => {
    const { can } = useCompany()

    const {
        register,
        handleSubmit,
        setValue,
        watch,
        formState: { errors },
    } = useCustomForm<SponsoredFormData>(SponsoredSchema, { name: sponsored.name, nickname: sponsored.nickname ?? '', gender: sponsored.gender ?? null })
    const { request, requestState } = useRequestQuery()

    const onSubmit = handleSubmit(async (data) => {
        try {
            /* El apodo sólo va si cambió (vacío = null, lo quita): si no se supo cuál tenía, dejarlo en blanco no lo borra */
            const nickname = data.nickname?.trim() || null
            const nicknameChanged = nickname !== (sponsored.nickname?.trim() || null)
            /* El sexo sólo va si hay uno elegido: la API rechaza `gender: null` («filled») */
            const body = { name: data.name, ...(nicknameChanged ? { nickname } : {}), ...(data.gender ? { gender: data.gender } : {}) }
            const response = await request<SponsoredFormData, ISponsored>('PUT', API_ROUTES.SPONSORED.UPDATE.replace('{id}', sponsored.id), body)
            if (response.success) {
                toast.success('Datos actualizados correctamente')
                onSuccess?.({ ...body, ...response.data })
            }
        } catch (error) {
            console.error(error)
        }
    })

    return (
        <form onSubmit={onSubmit}>
            <div className="flex flex-col gap-5 mx-auto mb-16">
                {/* Su apodo: sólo para el seguimiento de esta Directora (David, 26-nov-2026, opción A) */}
                <div>
                    <TextInput
                        label="Su apodo (opcional)"
                        placeholder="Lupita, Gaby, Mi Güera…"
                        register={register('nickname')}
                        error={errors.nickname?.message}
                    />
                    <p className="mt-1.5 px-0.5 text-[12px] leading-snug text-muted-foreground">
                        Sólo lo ves tú: sale en tu seguimiento{can('challenges') ? ', tus mensajes y tus retos' : ' y tus mensajes'}. Sus reconocimientos{can('newsletter') ? ' y tu boletín siguen' : ' siguen'} con su nombre completo.
                    </p>
                </div>

                <TextInput
                    label="Nombre Completo"
                    register={register('name')}
                    error={errors.name?.message}
                />

                <div>
                    <Label className="mb-2 block text-left text-[12.5px] font-bold">Sexo</Label>
                    {/* Volver a tocar el elegido lo deja vacío: se ignora, el sexo no se borra */}
                    <ToggleGroup type="single" variant="outline" value={watch('gender')?.toString() ?? ''} onValueChange={e => { if (e) setValue('gender', e as Gender) }}>
                        <ToggleGroupItem value={Gender.FEMALE} aria-label="Femenino">
                            Femenino
                        </ToggleGroupItem>
                        <ToggleGroupItem value={Gender.MALE} aria-label="Masculino">
                            Masculino
                        </ToggleGroupItem>
                    </ToggleGroup>
                </div>
            </div>

            <Button
                text='Guardar'
                type="submit"
                color="primary"
                rounded
                block
                loading={requestState.loading}
            />
        </form>
    )
}

export default VendorForm

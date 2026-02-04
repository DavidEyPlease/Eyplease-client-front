import useCustomForm from "@/hooks/useCustomForm"
import { DEFAULT_VALUES, EventFormData, EventFormSchema, ONLINE_PLATFORMS } from "./form"
import TextInput from "@/components/common/Inputs/TextInput"
import { Textarea } from "@/components/ui/textarea"
import PrimaryButton from "@/components/common/Button"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import useRequestQuery from "@/hooks/useRequestQuery"
import { API_ROUTES } from "@/constants/api"
import { ApiResponse } from "@/interfaces/common"
import { EventType, IEvent } from "@/interfaces/events"
import { useFieldArray } from "react-hook-form"
import DynamicTabs from "@/components/generics/DynamicTabs"
import { Field, FieldGroup, FieldLabel, FieldLegend, FieldSet } from "@/components/ui/field"
import { Checkbox } from "@/components/ui/checkbox"
import { Button } from "@/components/ui/button"
import { PlusIcon, TrashIcon } from "lucide-react"
import DatePicker from "@/components/common/Inputs/DatePicker"
import { Input } from "@/components/ui/input"
import { formatDate } from "@/utils/dates"

interface EventFormProps {
    item?: IEvent
    onHandleSuccess: (event: IEvent) => void
}

const EventForm = ({ item, onHandleSuccess }: EventFormProps) => {
    const isEdit = Boolean(item)

    const {
        register,
        handleSubmit,
        formState: { errors },
        control: formControl,
        reset: formReset,
        watch,
        setValue
    } = useCustomForm<EventFormData>(
        EventFormSchema,
        item ? {
            title: item.title,
            description: item.description,
            event_type: item.event_type,
            online_data: item.online_data || undefined,
            dates: item.dates.length > 0 ? item.dates.map(date => ({
                date: new Date(date.start_date),
                time: formatDate(date.start_date, { formatter: 'HH:mm:ss' }),
                location: date.location
            })) : [],
            metadata: {
                primaryColor: item.service?.metadata?.primaryColor || '#000000',
                secondaryColor: item.service?.metadata?.secondaryColor || '#FFFFFF',
            }
        } : { ...DEFAULT_VALUES }
    )
    const { fields: dates, append: appendDate, remove: removeDate } = useFieldArray({
        control: formControl,
        name: "dates"
    })

    const { request, requestState } = useRequestQuery({
        onSuccess: (response: ApiResponse<IEvent>) => {
            formReset()
            if (response.success) {
                onHandleSuccess(response.data)
            }
        }
    })

    const onSubmit = handleSubmit(async (data) => {
        let endpoint = API_ROUTES.CREATE_EVENT
        if (isEdit && item) {
            endpoint = API_ROUTES.UPDATE_EVENT.replace('{id}', item.id)
        }
        await request(isEdit ? 'PUT' : 'POST', endpoint, {
            ...data,
            dates: data.dates.map(d => ({
                ...d,
                date: formatDate(d.date, { formatter: 'YYYY-MM-DD' })
            }))
        })
    })

    const onSelectOnlinePlatform = (platform: string, checked: boolean) => {
        const currentPlatforms = watch('online_data.platforms') || []
        if (checked) {
            setValue('online_data.platforms', [...currentPlatforms, platform])
        } else {
            setValue('online_data.platforms', currentPlatforms.filter(p => p !== platform))
        }
    }

    const eventType = watch('event_type')

    return (
        <form className="flex flex-col gap-4" onSubmit={onSubmit}>
            <TextInput
                label="Título"
                register={register('title')}
                error={errors.title?.message}
            />
            <div>
                <Label className="mb-2">Descripción</Label>
                <Textarea
                    placeholder="Describe lo que necesitas, dimensiones, referencias, colores, etc."
                    className="mb-4"
                    {...register('description')}
                />

                <DynamicTabs
                    label="Tipo de evento"
                    items={[
                        { value: EventType.ONLINE, label: "Online" },
                        { value: EventType.PRESENTIAL, label: "Presencial" }
                    ]}
                    value={eventType}
                    onValueChange={value => setValue('event_type', value)}
                />
            </div>

            {eventType === 'online' && (
                <div className="flex flex-col gap-y-1">
                    <FieldSet>
                        <FieldLegend variant="label">
                            Medios de transmisión online
                        </FieldLegend>
                        <FieldGroup className="flex-row">
                            {ONLINE_PLATFORMS.map(platform => (
                                <Field orientation="horizontal" key={platform.value}>
                                    <Checkbox
                                        id={`online-platform-${platform.value}`}
                                        name={`online-platform-${platform.value}`}
                                        checked={watch('online_data.platforms')?.includes(platform.value)}
                                        onCheckedChange={v => onSelectOnlinePlatform(platform.value, v === true)}
                                    />
                                    <FieldLabel
                                        htmlFor={`online-platform-${platform.value}`}
                                        className="font-normal"
                                    >
                                        {platform.label}
                                    </FieldLabel>
                                </Field>
                            ))}
                        </FieldGroup>
                    </FieldSet>
                    <div className="grid md:grid-cols-3 gap-4">
                        <TextInput
                            label=""
                            placeholder="Grupo de Facebook"
                            disabled={!watch('online_data.platforms')?.includes('facebook')}
                            register={register('online_data.facebook_group')}
                            error={errors.online_data?.facebook_group?.message}
                        />
                        <TextInput
                            label=""
                            placeholder="ID de Zoom"
                            disabled={!watch('online_data.platforms')?.includes('zoom')}
                            register={register('online_data.zoom_id')}
                            error={errors.online_data?.zoom_id?.message}
                        />
                        <TextInput
                            label=""
                            placeholder="Otro medio"
                            disabled={!watch('online_data.platforms')?.includes('other')}
                            register={register('online_data.event_link')}
                            error={errors.online_data?.event_link?.message}
                        />
                    </div>
                </div>
            )}

            <Separator />

            <div className="flex justify-end items-center">
                <Button type="button" variant='ghost' className="text-primary" size='sm' onClick={() => appendDate({ date: new Date(), time: '', location: '' })}>
                    <PlusIcon />
                    Agregar fecha {eventType === 'presential' ? 'y dirección' : ''}
                </Button>
            </div>

            {dates.map((dateItem, index) => {
                const dateValue = watch(`dates.${index}.date`)
                const timeValue = watch(`dates.${index}.time`)
                return (
                    <div key={index} className="grid md:grid-cols-3 gap-2">
                        <DatePicker
                            label={`Fecha ${index + 1}`}
                            dateValue={dateValue}
                            onDisableDate={(d) => d.getTime() < new Date().setHours(0, 0, 0, 0)}
                            onDateChange={(date) => setValue(`dates.${index}.date`, date)}
                        />
                        <div>
                            <Label className="mb-2">Hora</Label>
                            <Input
                                type="time"
                                id={`time-picker-optional-${index}`}
                                step="1"
                                value={timeValue || ''}
                                onChange={(e) => setValue(`dates.${index}.time`, e.target.value)}
                                className="bg-background appearance-none [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:appearance-none"
                            />
                        </div>

                        <div className="flex items-end">
                            {eventType === 'presential' && (
                                <TextInput
                                    label="Ubicación"
                                    register={register(`dates.${index}.location`)}
                                    error={errors.dates?.[index]?.location?.message}
                                />
                            )}
                            {index > 0 && (
                                <Button
                                    size='icon'
                                    variant='ghost'
                                    type="button"
                                    className="text-red-400"
                                    onClick={() => removeDate(index)}
                                >
                                    <TrashIcon />
                                </Button>
                            )}
                        </div>
                    </div>
                )
            })}

            <Separator />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                    <div className="flex items-end gap-3">
                        <input
                            id="color-primario"
                            type="color"
                            className="h-9 w-12 rounded border"
                            aria-label="Seleccionar color primario"
                            value={watch('metadata.primaryColor') || ''}
                            onChange={(e) => setValue('metadata.primaryColor', e.target.value)}
                        />
                        <TextInput
                            label="Color primario"
                            placeholder="#000000"
                            register={register('metadata.primaryColor')}
                            pattern="^#([0-9A-Fa-f]{6})$"
                            error={errors.metadata?.primaryColor?.message}
                        />
                    </div>
                </div>
                <div className="space-y-2">
                    <div className="flex items-end gap-3">
                        <input
                            id="color-secundario"
                            type="color"
                            className="h-9 w-12 rounded border"
                            aria-label="Seleccionar color secundario"
                            value={watch('metadata.secondaryColor') || ''}
                            onChange={(e) => setValue('metadata.secondaryColor', e.target.value)}
                        />
                        <TextInput
                            label="Color secundario"
                            placeholder="#999999"
                            register={register('metadata.secondaryColor')}
                            pattern="^#([0-9A-Fa-f]{6})$"
                            error={errors.metadata?.secondaryColor?.message}
                        />
                    </div>
                </div>
            </div>

            <Separator />

            <PrimaryButton
                text={isEdit ? 'Guardar cambios' : 'Crear evento'}
                type="submit"
                color="primary"
                rounded
                className="mx-auto"
                // block
                loading={requestState.loading}
            />
        </form>
    )
}

export default EventForm
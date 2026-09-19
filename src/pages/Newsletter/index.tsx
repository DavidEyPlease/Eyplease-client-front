import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router'
import { ArrowRightIcon, CheckIcon, DownloadIcon, EyeIcon, EyeOffIcon, FileTextIcon, PresentationIcon, SlidersHorizontalIcon } from 'lucide-react'

import ContentPreferencesSheet from '@/components/reportPreferences/ContentPreferencesSheet'
import { hiddenSummaryLabel } from '@/components/reportPreferences/utils'
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog'
import { API_ROUTES } from '@/constants/api'
import { APP_ROUTES } from '@/constants/app'
import useFetchQuery from '@/hooks/useFetchQuery'
import { PermissionKeys } from '@/interfaces/permissions'
import { IReportUpload } from '@/interfaces/reportUpload'
import { isNewShell } from '@/layouts/TopShell/useNewShell'
import { cn } from '@/lib/utils'
import AnnualReport from '@/pages/Dashboard/components/AnnualReport'
import Newsletter from '@/pages/Dashboard/components/Newsletter'
import { useNewsletterWizard } from '@/pages/Dashboard/components/Newsletter/useNewsletterWizard'
import { NEWSLETTER_TYPE_META, ReportFileType } from '@/pages/Dashboard/components/Newsletter/wizardSteps'
import RingMeter from '@/pages/Hoy/components/RingMeter'
import '@/pages/Hoy/hoy.css'
import { getImportableSections, NEWSLETTER_TAG, resolveSectionReport } from '@/pages/Reports/lib'
import useAuthStore from '@/store/auth'
import { queryKeys } from '@/utils/cache'
import { reportMonthLabel } from '@/utils/dates'

const CARD = 'shell-glass hoy-rise rounded-[22px] p-[18px]'
const TAG = 'inline-flex h-[22px] items-center gap-1.5 rounded-full px-2.5 text-[10.5px] font-bold tracking-wide whitespace-nowrap'
const SEGMENT = 'inline-flex rounded-xl bg-foreground/5 p-[3px]'
const SEGMENT_ITEM = 'flex h-8 cursor-pointer items-center gap-1.5 rounded-[9px] px-3 text-[12px] font-bold transition-colors'
const rise = (index: number) => ({ '--i': index } as React.CSSProperties)

const FORMATS: Array<{ value: ReportFileType, label: string, icon: typeof FileTextIcon }> = [
    { value: 'pdf', label: 'PDF', icon: FileTextIcon },
    { value: 'pptx', label: 'PowerPoint', icon: PresentationIcon },
]

/**
 * El boletín con el lenguaje del rediseño. Es EL MISMO generador (`useNewsletterWizard`: mismas
 * plantillas, secciones, configuración y generación en segundo plano), sin los cuatro pasos: todo
 * llega elegido —su plantilla o la más nueva, todas las secciones, PDF— y generar es un clic.
 */
const NewsletterStudio = () => {
    const wizard = useNewsletterWizard()
    const user = useAuthStore(state => state.user)
    const canUploadReports = useAuthStore(state => state.permissions.includes(PermissionKeys.REPORTS_UPLOAD))
    const [submitted, setSubmitted] = useState(false)
    const [sheetOpen, setSheetOpen] = useState(false)

    const { type, newsletters, templates, templateId, setType, setTemplateId } = wizard

    /* La más nueva es la ÚLTIMA del catálogo: se enseñan de la más nueva a la más vieja */
    const ordered = useMemo(() => [...templates].reverse(), [templates])
    const newest = ordered[0]

    /* Con varios boletines se abre en el primero; con uno solo ya lo elige el generador */
    useEffect(() => {
        if (!type && newsletters.length > 1) setType(newsletters[0].code)
    }, [type, newsletters, setType])

    /* Sin plantilla guardada, la más nueva */
    useEffect(() => {
        if (!templateId && newest) setTemplateId(newest.id)
    }, [templateId, newest, setTemplateId])

    const { response: uploads } = useFetchQuery<IReportUpload[]>(API_ROUTES.REPORTS.LIST_UPLOADS, {
        customQueryKey: queryKeys.list('report-uploads'),
        enabled: !!newsletters.length,
    })

    /* Los reportes de ESTE boletín: son los que deciden si sale completo */
    const reports = useMemo(() => {
        const newsletter = newsletters.find(item => item.code === type)
        if (!newsletter) return { total: 0, loaded: 0, missing: [] as string[] }
        const sections = getImportableSections(newsletter)
        const missing = sections.filter(section => resolveSectionReport(uploads?.data ?? [], section.id).status !== 'completed').map(section => section.name)
        return { total: sections.length, loaded: sections.length - missing.length, missing }
    }, [newsletters, type, uploads])

    const selected = wizard.selectedTemplate
    const selectable = wizard.availableSections.filter(section => !wizard.hiddenSectionKeys.has(section.sectionKey))
    const allSelected = selectable.length > 0 && wizard.sections.length === selectable.length
    const hiddenSummary = hiddenSummaryLabel(wizard.hiddenSummary)
    const canGenerate = !!type && !!templateId && wizard.sections.length > 0
    const previewTemplate = templates.find(template => template.id === wizard.previewTemplateId)

    const onGenerate = () => {
        if (!canGenerate) return
        wizard.generate()
        setSubmitted(true)
    }

    return (
        <div className="grid grid-cols-1 gap-4">
            <header className="hoy-rise flex flex-wrap items-end justify-between gap-4">
                <div>
                    <p className="text-[10.5px] font-extrabold tracking-[.14em] text-[#6C47FF] uppercase dark:text-[#A894FF]">Boletín · {reportMonthLabel()}</p>
                    <h1 className="hoy-title mt-1 text-[28px] leading-[1.1] font-extrabold tracking-tight">Tu boletín, <em>en un clic</em></h1>
                    <p className="mt-1.5 max-w-[62ch] text-[13.5px] text-muted-foreground">Ya viene elegido: tu plantilla, todas tus secciones y PDF. Cambia lo que quieras y genera; se arma en segundo plano y te avisa cuando está listo.</p>
                </div>

                {newsletters.length > 1 && (
                    <div className={SEGMENT}>
                        {newsletters.map(newsletter => {
                            const Icon = NEWSLETTER_TYPE_META[newsletter.code]?.icon
                            return (
                                <button
                                    key={newsletter.code}
                                    type="button"
                                    title={NEWSLETTER_TYPE_META[newsletter.code]?.description}
                                    onClick={() => { setType(newsletter.code); setSubmitted(false) }}
                                    className={cn(SEGMENT_ITEM, type === newsletter.code ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground')}
                                >
                                    {Icon && <Icon className="size-3.5" />} {NEWSLETTER_TAG[newsletter.code] ?? newsletter.name}
                                </button>
                            )
                        })}
                    </div>
                )}
            </header>

            <AnnualReport />

            {reports.total > 0 && (
                <section className={cn(CARD, 'flex flex-wrap items-center gap-4')} style={rise(1)}>
                    <RingMeter percent={Math.round(reports.loaded / reports.total * 100)} size={64} stroke={7} label="">
                        <b className="text-[14px] font-extrabold tabular-nums">{reports.loaded}/{reports.total}</b>
                    </RingMeter>
                    <div className="min-w-0 flex-1">
                        <h2 className="text-[15px] font-extrabold tracking-tight">Reportes del mes</h2>
                        <p className="text-[12.5px] text-muted-foreground">
                            {reports.missing.length === 0
                                ? 'Todos cargados: tu boletín sale completo.'
                                : <>Falta{reports.missing.length === 1 ? '' : 'n'} <b className="text-foreground">{reports.missing.slice(0, 3).join(', ')}</b>{reports.missing.length > 3 ? ` y ${reports.missing.length - 3} más` : ''}. {reports.missing.length === 1 ? 'Esa sección saldría vacía.' : 'Esas secciones saldrían vacías.'}</>}
                        </p>
                    </div>
                    {canUploadReports && (
                        <Link to={APP_ROUTES.REPORTS} className="flex h-8 items-center gap-1.5 rounded-[11px] bg-[#6C47FF]/10 px-3 text-[12px] font-bold text-[#6C47FF] transition-colors hover:bg-[#6C47FF]/18 dark:text-[#C4B5FF]">
                            Ver reportes <ArrowRightIcon className="size-3.5" />
                        </Link>
                    )}
                </section>
            )}

            {/* La plantilla elegida, en grande: es lo que se va a generar */}
            <section className={cn(CARD, 'hoy-edge p-5')} style={rise(2)}>
                {selected ? (
                    <div className="grid items-center gap-x-7 gap-y-5 md:grid-cols-[minmax(0,340px)_minmax(0,1fr)]">
                        <button type="button" onClick={() => wizard.setPreviewTemplateId(selected.id)} className="group relative block cursor-zoom-in overflow-hidden rounded-[18px] shadow-[0_24px_60px_-24px_rgba(27,20,80,.55)]">
                            <img key={selected.id} src={selected.picture.url} alt={selected.name} className="hoy-piece aspect-4/3 w-full object-cover transition-transform duration-700 group-hover:scale-[1.04]" />
                            <span className="absolute right-3 bottom-3 flex h-7 items-center gap-1.5 rounded-full bg-black/55 px-2.5 text-[11px] font-bold text-white opacity-0 backdrop-blur-md transition-opacity group-hover:opacity-100"><EyeIcon className="size-3.5" /> Vista previa</span>
                        </button>

                        <div className="min-w-0">
                            <div className="flex flex-wrap gap-1.5">
                                {selected.id === newest?.id && <span className={cn(TAG, 'bg-[#E5077D]/12 text-[#E5077D]')}>La más nueva</span>}
                                {selected.id === user?.template_id && <span className={cn(TAG, 'bg-[#6C47FF]/10 text-[#6C47FF] dark:text-[#BBAAFF]')}>Tu plantilla</span>}
                            </div>
                            <h2 className="mt-2 text-[24px] leading-tight font-extrabold tracking-tight">{selected.name}</h2>
                            <p className="mt-1 text-[13px] text-muted-foreground">
                                {wizard.selectedNewsletterName} · {wizard.sections.length} {wizard.sections.length === 1 ? 'sección' : 'secciones'} · {wizard.format === 'pdf' ? 'PDF' : 'PowerPoint'}
                            </p>

                            {submitted ? (
                                <div className="mt-4 flex flex-wrap items-center gap-3 rounded-2xl bg-emerald-500/12 px-4 py-3 text-[13px] text-emerald-800 dark:text-emerald-300">
                                    <span className="grid size-6 shrink-0 place-items-center rounded-lg bg-emerald-500/20"><CheckIcon className="size-3.5" strokeWidth={3} /></span>
                                    <span className="min-w-0 flex-1">Se está generando. Lo ves y lo descargas en el panel de tareas, abajo a la derecha.</span>
                                    <button type="button" onClick={() => setSubmitted(false)} className="cursor-pointer text-[12.5px] font-bold text-primary hover:underline">Generar otro</button>
                                </div>
                            ) : (
                                <div className="mt-4 flex flex-wrap items-center gap-2.5">
                                    <button type="button" disabled={!canGenerate} onClick={onGenerate} className="hoy-cta flex h-11 cursor-pointer items-center gap-2 rounded-[13px] px-5 text-[13.5px] font-bold text-white disabled:cursor-default disabled:opacity-50">
                                        <DownloadIcon className="size-4" /> Generar boletín
                                    </button>
                                    <div className={SEGMENT}>
                                        {FORMATS.map(({ value, label, icon: Icon }) => (
                                            <button key={value} type="button" onClick={() => wizard.setFormat(value)} className={cn(SEGMENT_ITEM, wizard.format === value ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground')}>
                                                <Icon className="size-3.5" /> {label}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}
                            {!submitted && !wizard.sections.length && !!type && <p className="mt-2 text-[12px] text-amber-700 dark:text-amber-400">Elige al menos una sección para generar.</p>}
                        </div>
                    </div>
                ) : (
                    <div className="grid gap-5 md:grid-cols-[minmax(0,340px)_minmax(0,1fr)]">
                        <span className="hoy-skel aspect-4/3 rounded-[18px]" />
                        <span className="grid content-center gap-2.5"><span className="hoy-skel h-6 w-48 rounded-full" /><span className="hoy-skel h-3.5 w-64 rounded-full" /><span className="hoy-skel mt-2 h-11 w-44 rounded-[13px]" /></span>
                    </div>
                )}
            </section>

            <section className={CARD} style={rise(3)}>
                <div className="mb-3 flex flex-wrap items-baseline justify-between gap-x-3">
                    <h2 className="text-[15px] font-extrabold tracking-tight">Todas las plantillas</h2>
                    <small className="text-[11.5px] text-muted-foreground">De la más nueva a la primera · elige una y cambia arriba</small>
                </div>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-5">
                    {ordered.map(template => {
                        const active = template.id === templateId
                        return (
                            <div key={template.id} className="group relative">
                                <button
                                    type="button"
                                    onClick={() => { setTemplateId(template.id); setSubmitted(false) }}
                                    className={cn(
                                        'block w-full cursor-pointer overflow-hidden rounded-2xl border-2 text-left transition-all duration-300',
                                        active ? 'border-[#6C47FF] shadow-[0_0_0_3px_rgba(108,71,255,.16)]' : 'border-transparent hover:-translate-y-0.5 hover:shadow-[0_18px_40px_-20px_rgba(27,20,80,.5)]',
                                    )}
                                >
                                    <img src={template.picture.url} alt="" loading="lazy" className="aspect-4/3 w-full object-cover" />
                                    <span className="flex items-center gap-1.5 bg-card/80 px-2.5 py-2 text-[12px] font-bold">
                                        {active && <CheckIcon className="size-3.5 shrink-0 text-[#6C47FF]" strokeWidth={3} />}
                                        <span className="truncate">{template.name}</span>
                                    </span>
                                </button>
                                <button type="button" aria-label={`Vista previa de ${template.name}`} onClick={() => wizard.setPreviewTemplateId(template.id)} className="absolute top-2 right-2 grid size-8 cursor-pointer place-items-center rounded-full bg-white/90 text-[#1A1830] opacity-0 shadow-md transition-opacity group-hover:opacity-100 focus-visible:opacity-100">
                                    <EyeIcon className="size-4" />
                                </button>
                            </div>
                        )
                    })}
                </div>
            </section>

            {!!type && (
                <section className={CARD} style={rise(4)}>
                    <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-2">
                        <div>
                            <h2 className="text-[15px] font-extrabold tracking-tight">Secciones de este boletín</h2>
                            <p className="text-[12px] text-muted-foreground">{wizard.sections.length} de {selectable.length} · sólo para esta vez; lo permanente va en «Personalizar contenido»</p>
                        </div>
                        <div className="flex gap-2">
                            <button type="button" onClick={wizard.toggleAllSections} className="h-8 cursor-pointer rounded-[11px] bg-foreground/5 px-3 text-[12px] font-bold transition-colors hover:bg-foreground/10">{allSelected ? 'Quitar todas' : 'Marcar todas'}</button>
                            <button type="button" onClick={() => setSheetOpen(true)} className="flex h-8 cursor-pointer items-center gap-1.5 rounded-[11px] bg-[#6C47FF]/10 px-3 text-[12px] font-bold text-[#6C47FF] transition-colors hover:bg-[#6C47FF]/18 dark:text-[#C4B5FF]">
                                <SlidersHorizontalIcon className="size-3.5" /> Personalizar contenido
                            </button>
                        </div>
                    </div>

                    <div className="mt-3.5 flex flex-wrap gap-2">
                        {wizard.availableSections.map(section => {
                            /* Oculta por su configuración: se enseña para explicar por qué falta, y se cambia en el panel */
                            if (wizard.hiddenSectionKeys.has(section.sectionKey)) {
                                return (
                                    <button key={section.sectionKey} type="button" title="Oculta por tu configuración. Toca para cambiarla." onClick={() => setSheetOpen(true)} className="inline-flex h-9 cursor-pointer items-center gap-2 rounded-full border border-dashed px-3.5 text-[12.5px] font-medium text-muted-foreground/80">
                                        <EyeOffIcon className="size-3.5" /> {section.name}
                                    </button>
                                )
                            }
                            const on = wizard.sections.includes(section.sectionKey)
                            return (
                                <button
                                    key={section.sectionKey}
                                    type="button"
                                    onClick={() => { wizard.toggleSection(section.sectionKey); setSubmitted(false) }}
                                    className={cn('inline-flex h-9 cursor-pointer items-center gap-2 rounded-full border px-3.5 text-[12.5px] font-semibold transition-colors', on ? 'border-[#6C47FF]/35 bg-[#6C47FF]/10 text-[#6C47FF] dark:text-[#C4B5FF]' : 'bg-card/60 text-muted-foreground hover:border-[#6C47FF]/35')}
                                >
                                    <span className={cn('grid size-[15px] place-items-center rounded-[5px] border-[1.5px] transition-colors', on ? 'border-[#6C47FF] bg-[#6C47FF] text-white' : 'border-border')}>
                                        {on && <CheckIcon className="size-2.5" strokeWidth={3.5} />}
                                    </span>
                                    {section.name}
                                </button>
                            )
                        })}
                    </div>

                    {hiddenSummary && (
                        <p className="mt-3.5 text-[12px] text-muted-foreground">
                            Tu configuración oculta {hiddenSummary}. <button type="button" onClick={() => setSheetOpen(true)} className="cursor-pointer font-bold text-primary hover:underline">Editar</button>
                        </p>
                    )}
                </section>
            )}

            <Dialog open={!!previewTemplate} onOpenChange={open => { if (!open) wizard.setPreviewTemplateId(null) }}>
                <DialogContent className="overflow-hidden rounded-[24px] border-none p-0 sm:max-w-[760px]">
                    {previewTemplate && (
                        <>
                            <DialogTitle className="sr-only">{previewTemplate.name}</DialogTitle>
                            <DialogDescription className="sr-only">Vista previa de la portada de tu boletín</DialogDescription>
                            <div className="relative grid max-h-[70vh] place-items-center overflow-hidden bg-[#0d0c1d]">
                                <img src={previewTemplate.picture.url} alt="" aria-hidden className="absolute inset-0 size-full scale-125 object-cover opacity-50 blur-3xl" />
                                <img src={previewTemplate.picture.url} alt={previewTemplate.name} className="relative max-h-[70vh] w-full object-contain" />
                            </div>
                            <div className="flex flex-wrap items-center gap-3 p-5">
                                <div className="min-w-0 flex-1">
                                    <p className="truncate text-[16px] font-extrabold">{previewTemplate.name}</p>
                                    <p className="text-[12.5px] text-muted-foreground">Así se verá la portada de tu boletín</p>
                                </div>
                                <button type="button" onClick={() => { setTemplateId(previewTemplate.id); setSubmitted(false); wizard.setPreviewTemplateId(null) }} className="hoy-cta h-10 cursor-pointer rounded-[13px] px-5 text-[13px] font-bold text-white">
                                    {previewTemplate.id === templateId ? 'Es la elegida' : 'Usar esta plantilla'}
                                </button>
                            </div>
                        </>
                    )}
                </DialogContent>
            </Dialog>

            <ContentPreferencesSheet open={sheetOpen} preferences={wizard.preferences} newsletterCode={type} onOpenChange={setSheetOpen} />
        </div>
    )
}

/**
 * El boletín, en su propia página. Con el marco nuevo lleva su piel; con el de siempre (por si
 * alguien llega por la dirección) sale el generador por pasos, tal cual vive en el Inicio.
 */
const NewsletterPage = () => isNewShell()
    ? <NewsletterStudio />
    : (
        <div className="grid gap-y-5">
            <AnnualReport />
            <Newsletter />
        </div>
    )

export default NewsletterPage

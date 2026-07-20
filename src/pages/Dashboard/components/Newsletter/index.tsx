import { useState } from 'react'
import { Check, Download } from 'lucide-react'
import useAuthStore from '@/store/auth'
import { reportMonthLabel } from '@/utils/dates'
import Spinner from '@/components/common/Spinner'
import Button from '@/components/common/Button'
import { wizardStepper, WizardStepId } from './wizardSteps'
import { useNewsletterWizard } from './useNewsletterWizard'
import WizardStepper from './WizardStepper'
import WizardLivePreview from './WizardLivePreview'
import TemplatePreviewDialog from './TemplatePreviewDialog'
import StepType from './steps/StepType'
import StepTemplate from './steps/StepTemplate'
import StepSections from './steps/StepSections'
import StepFormat from './steps/StepFormat'

const { useStepper, steps } = wizardStepper

/**
 * Generador del boletín mensual como asistente por pasos (Tipo → Plantilla →
 * Secciones → Formato) con vista en vivo. La generación corre en segundo plano y su
 * progreso/descarga los gestiona el centro de tareas.
 */
const Newsletter = () => {
    const stepper = useStepper()
    const wizard = useNewsletterWizard()
    const initialLoading = useAuthStore(state => state.initialLoading)
    const [submitted, setSubmitted] = useState(false)

    const currentId = stepper.current.id as WizardStepId
    const canContinue = wizard.isStepValid(currentId)

    const handleNext = () => {
        if (!canContinue) return
        if (stepper.isLast) {
            wizard.generate()
            setSubmitted(true)
        } else {
            stepper.next()
        }
    }

    const handleReset = () => {
        setSubmitted(false)
        stepper.goTo('type')
    }

    const renderStep = () => {
        switch (currentId) {
            case 'type':
                return <StepType wizard={wizard} />
            case 'template':
                return <StepTemplate wizard={wizard} />
            case 'sections':
                return <StepSections wizard={wizard} />
            case 'format':
                return <StepFormat wizard={wizard} />
        }
    }

    const previewTemplate = wizard.templates.find(t => t.id === wizard.previewTemplateId)

    return (
        <div className="overflow-hidden rounded-3xl border border-[#ecebf3] bg-card shadow-[0_10px_30px_-12px_rgba(41,27,105,0.22)]">
            <div className="relative border-b border-[#ecebf3] bg-[radial-gradient(600px_200px_at_90%_-60%,rgba(107,79,227,0.1),transparent_70%)] p-5">
                <h1 className="text-xl font-bold tracking-tight">Boletín del mes</h1>
                <p className="text-sm text-muted-foreground">Un paso a la vez, con vista previa en vivo de lo que llevas elegido.</p>
                <span className="absolute right-7.5 top-6 inline-flex items-center rounded-full border border-primary/20 bg-primary/5 px-3 py-1.5 text-[13px] font-semibold text-primary">
                    {reportMonthLabel()}
                </span>
            </div>

            {initialLoading ? (
                <div className="grid place-content-center py-20">
                    <Spinner color="primary" />
                </div>
            ) : (
                <div className="grid lg:grid-cols-[1fr_328px]">
                    <div className="flex flex-col border-b border-[#ecebf3] p-5 lg:border-b-0 lg:border-r">
                        <WizardStepper
                            steps={steps}
                            currentIndex={stepper.index}
                            isStepValid={wizard.isStepValid}
                            onStepClick={id => stepper.goTo(id)}
                        />

                        <div key={currentId} className="min-h-71.5 flex-1 animate-in fade-in duration-200">
                            {renderStep()}
                        </div>

                        {submitted ? (
                            <div className="mt-1.5 border-t border-[#ecebf3] py-4">
                                <div className="flex flex-wrap items-center gap-3 rounded-xl border border-[#cdeed7] bg-[#ecfdf3] p-4 text-[13.5px] text-[#166534]">
                                    <span className="grid size-6 shrink-0 place-content-center rounded-lg bg-[#d6f5e2] text-[#16a34a]">
                                        <Check className="size-3" strokeWidth={3} />
                                    </span>
                                    <span className="min-w-0 flex-1">
                                        Tu boletín <b className="font-semibold">{wizard.selectedNewsletterName}</b> se está generando. Míralo en el panel de
                                        tareas para descargarlo.
                                    </span>
                                    <button type="button" onClick={handleReset} className="text-[12.5px] font-semibold text-primary hover:underline">
                                        Generar otro boletín
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="mt-1.5 flex items-center gap-3 border-t border-[#ecebf3] py-4">
                                <button
                                    type="button"
                                    disabled={stepper.isFirst}
                                    onClick={() => stepper.prev()}
                                    className="rounded-xl border border-[#e2e0ee] bg-card px-5 py-3 text-sm font-semibold text-muted-foreground transition-colors duration-150 hover:border-[#cfcbe4] hover:text-foreground disabled:cursor-not-allowed disabled:opacity-40"
                                >
                                    Atrás
                                </button>
                                <span className="flex-1" />
                                <Button
                                    text={
                                        stepper.isLast ? (
                                            <span className="flex items-center gap-2.5">
                                                <Download className="size-4" />
                                                Generar boletín
                                            </span>
                                        ) : (
                                            'Continuar'
                                        )
                                    }
                                    className="px-6 py-3 text-[14.5px]"
                                    disabled={!canContinue}
                                    onClick={handleNext}
                                />
                            </div>
                        )}
                    </div>

                    <WizardLivePreview wizard={wizard} stepNumber={stepper.index + 1} totalSteps={steps.length} />
                </div>
            )}

            <TemplatePreviewDialog
                template={previewTemplate}
                open={!!wizard.previewTemplateId}
                onOpenChange={open => !open && wizard.setPreviewTemplateId(null)}
                onUse={() => {
                    if (wizard.previewTemplateId) wizard.setTemplateId(wizard.previewTemplateId)
                    wizard.setPreviewTemplateId(null)
                }}
            />
        </div>
    )
}

export default Newsletter

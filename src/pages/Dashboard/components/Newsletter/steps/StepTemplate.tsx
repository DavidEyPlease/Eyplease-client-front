import { NewsletterWizard } from '../useNewsletterWizard'
import TemplateCard from '../TemplateCard'

/** Paso 2 — galería de plantillas: al pasar el cursor se refleja en la vista en vivo. */
const StepTemplate = ({ wizard }: { wizard: NewsletterWizard }) => (
    <div>
        <h3 className="text-[16.5px] font-bold">Elige tu plantilla</h3>
        <p className="mb-4.5 text-[13px] text-muted-foreground">
            Pásale el cursor para verla en la vista en vivo, o toca el ojo para ampliarla.
        </p>

        <div className="grid grid-cols-2 gap-3.5 md:grid-cols-3">
            {wizard.templates.map(template => (
                <TemplateCard
                    key={template.id}
                    template={template}
                    selected={wizard.templateId === template.id}
                    onSelect={() => wizard.setTemplateId(template.id)}
                    onPreview={() => wizard.setPreviewTemplateId(template.id)}
                    onHoverChange={hovering => wizard.setHoverTemplateId(hovering ? template.id : null)}
                />
            ))}
        </div>
    </div>
)

export default StepTemplate

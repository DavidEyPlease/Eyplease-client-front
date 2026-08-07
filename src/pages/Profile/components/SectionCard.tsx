interface Props {
    icon: React.ReactNode
    title: string
    description?: string
    children: React.ReactNode
}

/** Tarjeta de sección del perfil: cabecera con icono, título y subtítulo. */
const SectionCard = ({ icon, title, description, children }: Props) => {
    return (
        <section className="overflow-hidden rounded-3xl border bg-card shadow-card">
            <header className="flex items-center gap-3 border-b border-border/60 px-5 py-3.5">
                <span className="grid size-8 shrink-0 place-content-center rounded-lg bg-primary/[0.08] text-primary [&_svg]:size-4">
                    {icon}
                </span>
                <div>
                    <h3 className="text-[14.5px] font-extrabold tracking-tight">{title}</h3>
                    {description && <p className="text-[11.5px] font-medium text-muted-foreground">{description}</p>}
                </div>
            </header>
            <div className="p-5">{children}</div>
        </section>
    )
}

export default SectionCard

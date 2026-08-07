interface Props {
    icon: React.ReactNode
    title: string
    count?: number
    action?: React.ReactNode
    children: React.ReactNode
}

/** Bloque del workspace: cabecera con icono/título/contador y cuerpo con el contenido. */
const WorkspaceSection = ({ icon, title, count, action, children }: Props) => {
    return (
        <section className="overflow-hidden rounded-2xl border bg-card">
            <header className="flex items-center gap-2 border-b border-border/60 bg-surface-soft px-3.5 py-2.5 text-[11px] font-extrabold tracking-wider text-muted-foreground uppercase [&_svg]:size-3.5 [&_svg]:shrink-0">
                {icon}
                {title}
                {count !== undefined && (
                    <span className="rounded-full bg-primary/[0.08] px-2 py-px text-[10.5px] font-bold tracking-normal text-primary normal-case">
                        {count}
                    </span>
                )}
                {action && <div className="ml-auto">{action}</div>}
            </header>
            <div className="p-3.5">{children}</div>
        </section>
    )
}

export default WorkspaceSection

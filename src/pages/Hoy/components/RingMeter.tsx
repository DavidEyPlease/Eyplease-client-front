interface Props {
    percent: number
    size?: number
    /** Grosor del trazo: los anillos chicos lo quieren más fino */
    stroke?: number
    label?: string
    /** Lo que va en el centro en lugar del porcentaje (p. ej. «8/9») */
    children?: React.ReactNode
}

/** El anillo del seguimiento: se llena al cargar, con el degradado de la marca. */
const RingMeter = ({ percent, size = 140, stroke = 9, label = 'de tu unidad', children }: Props) => {
    const radius = (size - stroke) / 2
    const length = 2 * Math.PI * radius
    const shown = Math.min(Math.max(percent, 0), 100)

    return (
        <div className="hoy-meter relative grid shrink-0 place-items-center">
            <svg width={size} height={size} className="-rotate-90">
                <defs>
                    <linearGradient id="hoy-meter-grad" x1="0" y1="0" x2="1" y2="1">
                        <stop offset="0" stopColor="#4E31C0" /><stop offset=".5" stopColor="#6C47FF" /><stop offset="1" stopColor="#2CD4D9" />
                    </linearGradient>
                </defs>
                <circle className="trk" cx={size / 2} cy={size / 2} r={radius} strokeWidth={stroke} />
                <circle
                    className="val"
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    strokeWidth={stroke}
                    stroke="url(#hoy-meter-grad)"
                    style={{ '--len': length, '--to': length * (1 - Math.max(shown, 2) / 100) } as React.CSSProperties}
                />
            </svg>
            <div className="absolute text-center">
                {children ?? <b className="block text-[26px] leading-none font-extrabold tracking-tight">{shown}%</b>}
                {label && <small className="text-[10.5px] font-semibold text-muted-foreground">{label}</small>}
            </div>
        </div>
    )
}

export default RingMeter

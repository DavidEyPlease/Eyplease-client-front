import { useEffect, useRef, useState } from 'react'

import './showcase.css'

/**
 * El boletín interactivo «en chiquito», en bucle: la portada, la carrera día por día (con su rebase al final) y el
 * Cuadro de Honor alrededor de la joya. Con las piezas reales de la Plantilla 9 (public/boletin/p9) y gente inventada.
 * Lo usan el bloque «Nuevo» de la página Boletín y el aviso que le sale a todas al entrar.
 * Se detiene cuando no se ve (otra pestaña o fuera de pantalla); con «reducir movimiento» se queda en la carrera ya
 * terminada.
 */
const BASE = '/boletin/p9'
const ESCENAS = ['Portada', 'La carrera', 'Cuadro de Honor'] as const
const DURA = [3600, 5600, 4200]
const TOTAL = DURA.reduce((a, b) => a + b, 0)
const DIAS = 30

/* Cinco consultoras inventadas y sus órdenes (día, puntos): Itzel lidera casi todo el mes y Edith la rebasa el 29 */
const CARRERA = [
    { id: 'e', nombre: 'Edith Serrano', tono: 338, ordenes: [[4, 603], [12, 778], [29, 1118]] },
    { id: 'i', nombre: 'Itzel Montes', tono: 322, ordenes: [[8, 1502], [22, 162]] },
    { id: 'm', nombre: 'Margarita Calderón', tono: 352, ordenes: [[9, 694], [18, 632]] },
    { id: 'n', nombre: 'Noemí Ríos', tono: 316, ordenes: [[2, 420], [14, 510], [27, 280]] },
    { id: 'z', nombre: 'Zaira Pacheco', tono: 345, ordenes: [[11, 1000]] },
]
const puntosAl = (dia: number) => CARRERA.map(p => ({ ...p, pts: p.ordenes.reduce((s, [d, v]) => (d <= dia ? s + v : s), 0) }))
const MAXIMO = Math.max(...puntosAl(DIAS).map(p => p.pts))
const iniciales = (nombre: string) => nombre.split(' ').map(n => n[0]).slice(0, 2).join('')
const ANILLO = Array.from({ length: 16 }, (_, i) => ({ i, tono: 315 + ((i * 23) % 60) }))

const escenaDe = (t: number) => {
    let resto = t % TOTAL
    for (let i = 0; i < DURA.length; i++) {
        if (resto < DURA[i]) return { escena: i, avance: resto / DURA[i] }
        resto -= DURA[i]
    }
    return { escena: 0, avance: 0 }
}

const FUENTES = 'https://fonts.googleapis.com/css2?family=Lora:ital,wght@0,500;0,600;0,700;1,500&family=Playfair+Display:ital,wght@0,500;0,600;0,700;1,500;1,600&family=Poppins:wght@400;500;600;700&family=Inter:wght@400;500;600;700&display=swap'

const BoletinShowcase = ({ className = '' }: { className?: string }) => {
    const caja = useRef<HTMLDivElement>(null)
    const quieto = typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
    const [estado, setEstado] = useState(quieto ? { escena: 1, dia: DIAS, avance: 1 } : { escena: 0, dia: 1, avance: 0 })

    /* las mismas letras que el boletín (Playfair Display e Inter); el motor usa el mismo enlace */
    useEffect(() => {
        if (document.getElementById('boletin-dinamico-fuentes')) return
        const l = document.createElement('link')
        l.id = 'boletin-dinamico-fuentes'
        l.rel = 'stylesheet'
        l.href = FUENTES
        document.head.appendChild(l)
    }, [])

    useEffect(() => {
        if (quieto || !caja.current) return
        let visible = true
        let raf = 0
        let antes = performance.now()
        let t = 0
        const io = new IntersectionObserver(([e]) => { visible = e.isIntersecting })
        io.observe(caja.current)
        const paso = (ahora: number) => {
            const dt = Math.min(100, ahora - antes)
            antes = ahora
            if (visible && !document.hidden) {
                t += dt
                const { escena, avance } = escenaDe(t)
                // la carrera corre en el 80 % de su escena y luego se queda en el día 30
                const dia = escena === 1 ? Math.max(1, Math.min(DIAS, Math.ceil((avance / 0.8) * DIAS))) : escena === 2 ? DIAS : 1
                setEstado(prev => (prev.escena === escena && prev.dia === dia && Math.abs(prev.avance - avance) < 0.02 ? prev : { escena, dia, avance }))
            }
            raf = requestAnimationFrame(paso)
        }
        raf = requestAnimationFrame(paso)
        return () => { cancelAnimationFrame(raf); io.disconnect() }
    }, [quieto])

    const tabla = puntosAl(estado.dia)
    const orden = [...tabla].sort((a, b) => b.pts - a.pts || a.id.localeCompare(b.id))
    const lugar = new Map(orden.map((p, i) => [p.id, i]))
    const lider = orden[0].pts > 0 ? orden[0].id : null

    return (
        <div ref={caja} className={`bsx ${className}`} aria-hidden="true" style={{ '--fondo': `url(${BASE}/kit-fondo-h.webp)` } as React.CSSProperties}>
            {/* 1. Portada */}
            <div className={`bsx-escena bsx-portada ${estado.escena === 0 ? 'is-on' : ''}`}>
                <div className="bsx-letras">
                    <span className="bsx-mes">Septiembre</span>
                    <img src={`${BASE}/kit-titulo.webp`} alt="" className="bsx-titulo" />
                    <span className="bsx-boton">Empezar</span>
                </div>
                <div className="bsx-marco">
                    <span className="bsx-foto" style={{ '--silueta': `url(${BASE}/kit-silueta.webp)` } as React.CSSProperties}><i /></span>
                    <img src={`${BASE}/kit-marco.webp`} alt="" />
                    <img src={`${BASE}/kit-f03.webp`} alt="" className="bsx-flota bsx-f1" />
                    <img src={`${BASE}/kit-f05.webp`} alt="" className="bsx-flota bsx-f2" />
                </div>
            </div>

            {/* 2. La carrera, día por día */}
            <div className={`bsx-escena bsx-carrera ${estado.escena === 1 ? 'is-on' : ''}`}>
                <div className="bsx-dia"><b>{estado.dia}</b><span>de septiembre</span></div>
                <div className="bsx-pista">
                    {tabla.map(p => {
                        const pos = lugar.get(p.id) ?? 0
                        return (
                            <div key={p.id} className="bsx-fila" style={{ transform: `translateY(${pos * 100}%)` }}>
                                <span className="bsx-pos">{pos + 1}</span>
                                <span className="bsx-av" style={{ '--tono': p.tono } as React.CSSProperties}>{iniciales(p.nombre)}{lider === p.id && <i className="bsx-corona" />}</span>
                                <span className="bsx-nombre">{p.nombre}</span>
                                <span className="bsx-barra"><i style={{ width: `${(p.pts / MAXIMO) * 100}%` }} /></span>
                                <span className="bsx-pts">{p.pts.toLocaleString('es-MX')}</span>
                            </div>
                        )
                    })}
                </div>
                {estado.dia >= 29 && <span className="bsx-rebase">¡Edith la rebasa el día 29!</span>}
            </div>

            {/* 3. Cuadro de Honor: la unidad alrededor de la joya */}
            <div className={`bsx-escena bsx-honor ${estado.escena === 2 ? 'is-on' : ''}`}>
                <img src={`${BASE}/kit-honor.webp`} alt="" className="bsx-honor-t" />
                <div className="bsx-anillo">
                    <img src={`${BASE}/kit-joya.webp`} alt="" className="bsx-joya" />
                    {ANILLO.map(({ i, tono }) => {
                        const ang = -Math.PI / 2 + (i * 2 * Math.PI) / ANILLO.length
                        return <span key={i} className="bsx-cara" style={{ left: `${50 + 44 * Math.cos(ang)}%`, top: `${50 + 44 * Math.sin(ang)}%`, '--tono': tono, '--d': `${0.15 + i * 0.06}s` } as React.CSSProperties} />
                    })}
                </div>
            </div>

            <div className="bsx-pasos">
                {ESCENAS.map((nombre, i) => (
                    <span key={nombre} className={i === estado.escena ? 'is-on' : ''}>
                        <i style={{ transform: `scaleX(${i < estado.escena ? 1 : i === estado.escena ? estado.avance : 0})` }} />
                        {nombre}
                    </span>
                ))}
            </div>
        </div>
    )
}

export default BoletinShowcase

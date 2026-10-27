import { useEffect, useRef, useState } from 'react'

import './showcase.css'
import './showcase-nacional.css'

/**
 * El boletín NACIONAL interactivo «en chiquito», en bucle: la ceremonia del Cuadro de Honor (tres finalistas boca abajo
 * y la corona), el auto rosa que entra manejando y el anillo de la Corte de Ventas. Con las piezas reales de la
 * Plantilla 9 y la joya del folleto 2027; la gente, inventada (sólo iniciales). Lo usa el aviso de novedad de las
 * Directoras Nacionales. Se detiene cuando no se ve; con «reducir movimiento» se queda en la corona ya revelada.
 */
const BASE = '/boletin/p9'
const ESCENAS = ['Cuadro de Honor', 'Trofeo sobre ruedas', 'Las Cortes'] as const
const DURA = 4800
const FINALISTAS = [{ ini: 'VM', lugar: '2.º lugar' }, { ini: 'DR', lugar: '¡Reina!' }, { ini: 'LH', lugar: '3.er lugar' }]
const FUENTES = 'https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,500;0,600;0,700;1,500&family=Inter:wght@400;500;600;700&display=swap'

const BoletinNacionalShowcase = ({ className = '' }: { className?: string }) => {
    const caja = useRef<HTMLDivElement>(null)
    const quieto = typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
    const [escena, setEscena] = useState(0)

    /* las mismas letras que el boletín (Playfair Display e Inter) */
    useEffect(() => {
        if (document.getElementById('boletin-nacional-fuentes')) return
        const l = document.createElement('link')
        l.id = 'boletin-nacional-fuentes'
        l.rel = 'stylesheet'
        l.href = FUENTES
        document.head.appendChild(l)
    }, [])

    useEffect(() => {
        if (quieto || !caja.current) return
        let visible = true
        const io = new IntersectionObserver(([e]) => { visible = e.isIntersecting })
        io.observe(caja.current)
        const t = setInterval(() => { if (visible && !document.hidden) setEscena(e => (e + 1) % ESCENAS.length) }, DURA)
        return () => { clearInterval(t); io.disconnect() }
    }, [quieto])

    return (
        <div ref={caja} className={`bsx bnx ${quieto ? 'bnx-quieto' : ''} ${className}`} aria-hidden="true" style={{ '--fondo': `url(${BASE}/kit-fondo-h.webp)`, '--dura': `${DURA}ms` } as React.CSSProperties}>
            {/* la barra de la página: que se vea desde el primer momento que es el boletín NACIONAL */}
            <div className="bnx-barra"><b>eyplease<i>+</i></b><span><small>Boletín nacional de septiembre</small>Tu Área completa</span></div>

            {/* 1. La ceremonia: tres finalistas boca abajo y la corona al final */}
            <div className={`bsx-escena bnx-honor ${escena === 0 ? 'is-on' : ''}`}>
                <span className="bnx-kicker">Top nacional de septiembre</span>
                <img src={`${BASE}/kit-honor.webp`} alt="" className="bnx-honor-t" />
                <div className="bnx-cartas">
                    {FINALISTAS.map(({ ini, lugar }, n) => (
                        <div key={ini} className={`bnx-carta ${n === 1 ? 'bnx-reina' : ''}`} style={{ '--n': n } as React.CSSProperties}>
                            <span className="bnx-a">?</span>
                            <span className="bnx-b"><b>{ini}</b><small>{lugar}</small></span>
                        </div>
                    ))}
                </div>
                <span className="bnx-pregunta">¿Quién se lleva la corona de septiembre?</span>
            </div>

            {/* 2. Trofeo sobre ruedas: el auto rosa entra manejando */}
            <div className={`bsx-escena bnx-trofeo ${escena === 1 ? 'is-on' : ''}`}>
                <span className="bnx-kicker">Trofeo sobre ruedas</span>
                <b className="bnx-tit">Conserva su auto rosa</b>
                <div className="bnx-pista">
                    <svg className="bnx-auto" viewBox="0 0 240 92">
                        <defs><linearGradient id="bnx-carro" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#ffe9f0" /><stop offset=".45" stopColor="#f3abc3" /><stop offset="1" stopColor="#9e4a63" /></linearGradient></defs>
                        <path fill="url(#bnx-carro)" stroke="#ffd2dc" strokeWidth="1.2" d="M34 70c-6 0-10-4-10-9 0-8 6-13 18-15l22-4 22-17c8-6 18-9 30-9h34c14 0 25 5 35 14l12 12c16 2 28 6 32 14 2 4 2 9 0 12-2 1-4 2-7 2H34z" />
                        <path fill="#3a1628" d="M92 41l18-14c6-4 12-6 20-6h12v20zM148 21h10c11 0 20 4 28 12l8 8h-46z" />
                        <g className="bnx-rueda" style={{ transformOrigin: '66px 70px' }}><circle cx="66" cy="70" r="15" fill="#1d0c16" stroke="#f3c0cc" strokeWidth="2" /><circle cx="66" cy="70" r="6" fill="#f6c76b" /><path stroke="#f6c76b" strokeWidth="2" d="M66 57v26M53 70h26" /></g>
                        <g className="bnx-rueda" style={{ transformOrigin: '190px 70px' }}><circle cx="190" cy="70" r="15" fill="#1d0c16" stroke="#f3c0cc" strokeWidth="2" /><circle cx="190" cy="70" r="6" fill="#f6c76b" /><path stroke="#f6c76b" strokeWidth="2" d="M190 57v26M177 70h26" /></g>
                    </svg>
                </div>
                <span className="bnx-sello">Primer nivel · trimestre a trimestre</span>
            </div>

            {/* 3. Las Cortes: la joya real del folleto y el avance de quien va en ruta */}
            <div className={`bsx-escena bnx-cortes ${escena === 2 ? 'is-on' : ''}`}>
                <div className="bnx-joya"><i /><img src="/boletin/joyas27/ventas.webp" alt="" /></div>
                <div className="bnx-cortes-txt">
                    <span className="bnx-kicker">Corte de Ventas</span>
                    <b className="bnx-tit">Su anillo, con 50,000 pts</b>
                    <span className="bnx-ruta"><span className="bnx-aro"><b>DR</b></span><span><b>Va en ruta</b><small>31,240 de 50,000 pts</small></span></span>
                </div>
            </div>

            <div className="bsx-pasos">
                {ESCENAS.map((nombre, i) => (
                    <span key={nombre} className={i === escena ? 'is-on' : ''}>
                        <i style={{ transform: `scaleX(${i < escena || quieto ? 1 : 0})` }} />
                        {nombre}
                    </span>
                ))}
            </div>
        </div>
    )
}

export default BoletinNacionalShowcase

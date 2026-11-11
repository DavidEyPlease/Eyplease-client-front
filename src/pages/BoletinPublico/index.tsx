import { useEffect, useRef, useState } from 'react'
import { useParams } from 'react-router'
import { useQuery } from '@tanstack/react-query'

import { API_ROUTES } from '@/constants/api'
import { ApiResponse } from '@/interfaces/common'
import HttpService from '@/services/http'
import { BoletinDinamicoDatos, crearBoletinDinamico } from '@/pages/NewsletterInteractive/dinamico/motor'
import { nombreMes, precargar } from '@/pages/NewsletterInteractive/meses'
import PantallaDeCarga from '@/pages/NewsletterInteractive/PantallaDeCarga'
import { useAvanceDeCarga } from '@/pages/NewsletterInteractive/useAvanceDeCarga'

type BoletinPublico = BoletinDinamicoDatos & { piel: 'p9' | 'p10', year_month: string }
type Persona = { foto?: string | null, fotoOriginal?: string | null }

/** Lo primero que se ve: las piezas de la portada y del Cuadro de Honor (como en la página de la Directora). */
const PIEZAS: Record<'p9' | 'p10', string[]> = {
    p9: ['kit-titulo', 'kit-honor', 'kit-joya', 'kit-marco', 'kit-silueta'],
    p10: ['portada_titulo', 'portada_filete', 'honor_linea1', 'honor_linea2', 'honor_emblema'],
}

/** Sólo para ver: sin «Cerrar» (no hay a dónde volver) ni Ajustes (Tempraneras y el mensaje los decide la Directora). */
const ESTILO_PUBLICO = '[data-volver],[data-ajustes],#ajustes{display:none !important}'

/**
 * El boletín interactivo que una Directora compartió con su unidad (`/b/{token}`): David, 11-nov-2026, «poderlo
 * compartir aunque sea como una liga… es útil para las consultoras». Se abre SIN cuenta y sólo para ver; es lo mismo
 * que ya manda en PDF o imágenes al grupo, pero vivo. El token de la liga es lo único que lo identifica; si la Directora
 * dejó de compartirla, venció o ya no tiene el plan, la API contesta 404 y aquí se dice. Que no lo indexen: trae nombres
 * y fotos de su unidad.
 */
const BoletinPublicoPage = () => {
    const { token = '' } = useParams()

    const { data: datos, isError } = useQuery({
        queryKey: ['boletin-publico', token],
        queryFn: async () => (await HttpService.get<ApiResponse<BoletinPublico>>(API_ROUTES.BOLETIN_PUBLICO.replace('{token}', encodeURIComponent(token)))).data,
        enabled: /^[A-Za-z0-9]{12,32}$/.test(token),
        retry: false,
        staleTime: 5 * 60 * 1000,
    })

    useEffect(() => {
        const meta = document.createElement('meta')
        meta.name = 'robots'
        meta.content = 'noindex, nofollow'
        document.head.appendChild(meta)
        return () => meta.remove()
    }, [])

    const piel = datos?.piel === 'p9' ? 'p9' : 'p10'
    const [imagenes, setImagenes] = useState(false)
    useEffect(() => {
        if (!datos) return
        let vigente = true
        const dir = (datos.directora ?? {}) as Persona
        const fondo = piel === 'p9' ? [window.matchMedia('(max-width: 767px)').matches ? 'kit-fondo-v' : 'kit-fondo-h'] : []
        const urls = [...PIEZAS[piel], ...fondo].map(f => `/boletin/${piel}/${f}.webp`).concat(dir.foto || dir.fotoOriginal || '').filter(Boolean)
        precargar(urls).then(() => { if (vigente) setImagenes(true) })
        return () => { vigente = false }
    }, [datos, piel])

    const noAbre = isError || !/^[A-Za-z0-9]{12,32}$/.test(token)
    const { avance, mostrar } = useAvanceDeCarga(datos && imagenes ? 100 : datos ? 92 : 40, token)
    const vacio = !!datos && !datos.personas?.length

    const hostRef = useRef<HTMLDivElement>(null)
    useEffect(() => {
        if (!hostRef.current || !datos || !mostrar || vacio) return
        window.scrollTo(0, 0)
        const boletin = crearBoletinDinamico(hostRef.current, datos, { piel, meses: [] })
        const extra = document.createElement('style')
        extra.textContent = ESTILO_PUBLICO
        hostRef.current.shadowRoot?.appendChild(extra)
        return () => boletin.destruir()
    }, [datos, mostrar, piel, vacio])

    const mes = datos?.year_month ? nombreMes(datos.year_month).toLowerCase() : ''
    const aviso = noAbre ? 'Esta liga ya no está disponible. Pídele a tu Directora la nueva.'
        : vacio ? `El boletín de ${mes} todavía no tiene datos.`
        : null

    return (
        <div className="boletin-dinamico min-h-dvh">
            {(!mostrar || aviso) && (
                <PantallaDeCarga
                    aviso={aviso}
                    avance={avance}
                    paso={datos ? 'Preparando la portada…' : 'Abriendo el boletín de tu unidad…'}
                    sello="Boletín interactivo · eyplease+"
                />
            )}
            <div ref={hostRef} />
        </div>
    )
}

export default BoletinPublicoPage

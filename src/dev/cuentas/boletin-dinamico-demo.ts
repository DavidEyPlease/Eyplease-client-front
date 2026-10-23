// SÓLO DEV: el boletín dinámico para el simulador de cuentas. Es la unidad de ejemplo que ven en producción los planes
// que no lo traen (NewsletterInteractive/ejemplo.ts); aquí, por omisión, sin fotos (para ver las iniciales).
import { boletinDeEjemplo } from '@/pages/NewsletterInteractive/ejemplo'

type Demo = Record<string, unknown> & { nuevas: Array<{ pasos: unknown[] }>, estrellas?: { lista: Array<Record<string, unknown>> } }

export const boletinDinamicoDemo = () => {
    // …&boletin=con-fotos: siluetas genéricas (nadie real) para ver cómo se acomodan las caras
    const datos = boletinDeEjemplo(sessionStorage.getItem('cuentas:boletin') === 'con-fotos') as unknown as Demo
    // sin acceso del robot a sus órdenes: lo que sale de ellas llega vacío, como lo manda la API
    if (sessionStorage.getItem('cuentas:boletin') === 'sin-ordenes') {
        Object.assign(datos, { eventos: [], productos: [], piezasMes: 0, ordenaYa: { personas: [], piezas: 0, productos: [] }, descuento: null })
        datos.nuevas = datos.nuevas.map(n => ({ ...n, pasos: [] }))
        if (datos.estrellas) datos.estrellas.lista = datos.estrellas.lista.map(x => ({ ...x, dia: null }))
    }
    // …&boletin=vacio: un mes sin reportes cargados (la API manda la unidad vacía)
    if (sessionStorage.getItem('cuentas:boletin') === 'vacio') {
        Object.assign(datos, { personas: [], eventos: [], cuadro: [], productos: [], nuevas: [], iniciadoras: [], camino: [], cumple: [], aniversarios: [], circulo: null, estrellas: null, descuento: null })
    }
    return datos
}

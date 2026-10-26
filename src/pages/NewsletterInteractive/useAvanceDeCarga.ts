import { useEffect, useState } from 'react'

/**
 * La carga de un boletín interactivo avanza por pasos reales (cuenta → datos → imágenes: `meta`) y entre uno y otro
 * se arrastra despacio, para que nunca parezca detenida. `mostrar` llega un momento después del 100: así la portada
 * se anima ya a la vista. Al cambiar `clave` (otro mes) la carga empieza otra vez.
 */
export const useAvanceDeCarga = (meta: number, clave: string) => {
    const [avance, setAvance] = useState(4)
    const [mostrar, setMostrar] = useState(false)
    useEffect(() => {
        // con todo listo termina rápido: la barra no debe alargar la espera
        const paso = meta === 100 ? (a: number) => Math.max(5, (100 - a) / 2.5) : (a: number) => Math.max(1, (meta - a) / 6)
        const t = setInterval(() => setAvance(a => (a < meta ? Math.min(meta, a + paso(a)) : a)), 110)
        return () => clearInterval(t)
    }, [meta])
    useEffect(() => {
        if (avance < 100) { setMostrar(false); return }
        const t = setTimeout(() => setMostrar(true), 280)
        return () => clearTimeout(t)
    }, [avance])
    useEffect(() => { setAvance(a => Math.min(a, 30)) }, [clave])

    return { avance, mostrar }
}

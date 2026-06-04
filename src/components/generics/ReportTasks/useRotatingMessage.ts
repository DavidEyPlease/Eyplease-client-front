import { useEffect, useState } from 'react'

// Cicla una lista de mensajes en intervalos regulares mientras `active` sea true.
// Se usa para la espera del PDF, que no expone progreso real desde el backend.
export const useRotatingMessage = (messages: string[], active: boolean, intervalMs = 2400) => {
    const [index, setIndex] = useState(0)

    useEffect(() => {
        if (!active || messages.length <= 1) return

        const timer = setInterval(() => {
            setIndex(prev => (prev + 1) % messages.length)
        }, intervalMs)

        return () => clearInterval(timer)
    }, [active, messages.length, intervalMs])

    return messages[index] ?? messages[0] ?? ''
}

import { useEffect, useState } from 'react'

const COLUMN_BREAKPOINTS = [
    { query: '(min-width: 1280px)', columns: 4 },
    { query: '(min-width: 1024px)', columns: 3 },
    { query: '(min-width: 640px)', columns: 2 },
]

const getColumnCount = () =>
    COLUMN_BREAKPOINTS.find(breakpoint => window.matchMedia(breakpoint.query).matches)?.columns ?? 1

/**
 * Número de columnas del mural según el viewport. Se reparte en JS (y no con
 * CSS columns) para que "Cargar más" añada al final sin recolocar lo ya visto.
 */
const useMasonryColumns = () => {
    const [columnCount, setColumnCount] = useState(getColumnCount)

    useEffect(() => {
        const mediaQueries = COLUMN_BREAKPOINTS.map(breakpoint => window.matchMedia(breakpoint.query))
        const onChange = () => setColumnCount(getColumnCount())

        mediaQueries.forEach(mediaQuery => mediaQuery.addEventListener('change', onChange))
        return () => mediaQueries.forEach(mediaQuery => mediaQuery.removeEventListener('change', onChange))
    }, [])

    return columnCount
}

export default useMasonryColumns

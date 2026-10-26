const MESES = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre']

/** Los últimos meses cerrados (AAAA-MM), del más reciente al más viejo: el del boletín por defecto es el anterior,
 *  igual que el PDF (`getReportDates`). */
export const ultimosMeses = (count: number): string[] => {
    const date = new Date()
    date.setDate(1)
    return Array.from({ length: count }, () => {
        date.setMonth(date.getMonth() - 1)
        return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
    })
}

/** «2026-09» → «Septiembre 2026» */
export const etiquetaMes = (yearMonth: string) => {
    const [year, month] = yearMonth.split('-').map(Number)
    const nombre = MESES[month - 1]
    return `${nombre[0].toUpperCase()}${nombre.slice(1)} ${year}`
}

/** «2026-09» → «septiembre» */
export const nombreMes = (yearMonth: string) => MESES[Number(yearMonth.split('-')[1]) - 1]

export const esMes = (valor: string | null): valor is string => !!valor && /^\d{4}-(0[1-9]|1[0-2])$/.test(valor)

export const precargar = (urls: string[], tope = 6000) => Promise.race([
    Promise.all(urls.map(url => new Promise<void>(listo => {
        const img = new Image()
        img.onload = img.onerror = () => listo()
        img.src = url
    }))),
    new Promise<void>(listo => setTimeout(listo, tope)),
])

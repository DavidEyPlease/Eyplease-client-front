import { API_ROUTES } from '@/constants/api'
import { ApiResponse } from '@/interfaces/common'
import type { BoletinAdoptivaGuardar, BoletinNacionalAjustes, BoletinNacionalOpciones } from '@/pages/NewsletterInteractive/nacional/motor'
import HttpService from '@/services/http'

/** El error de la API, en palabras para la Directora: el de la regla (p. ej. «Ya tienes 10…») o uno general. */
const motivo = (error: unknown): never => {
    const e = error as { message?: unknown, errors?: Record<string, unknown> } | null
    if (e?.errors && Object.keys(e.errors).length) throw new Error('Revisa sus datos: alguno no es válido.')
    const m = typeof e?.message === 'string' ? e.message : ''
    throw new Error(m && m.length < 140 && !/error interno|server error|unauthorized|failed to fetch/i.test(m) ? m : 'No se pudo guardar. Revisa tu conexión e inténtalo otra vez.')
}

/** Una adoptiva va como formulario con su foto (ya achicada en el teléfono). */
const formulario = (yearMonth: string, a: BoletinAdoptivaGuardar) => {
    const f = new FormData()
    f.append('year_month', yearMonth)
    f.append('nombre', a.nombre)
    f.append('datos', JSON.stringify(a.datos))
    if (a.foto) f.append('foto', a.foto, 'foto.jpg')
    if (a.fotoDe) f.append('foto_de', a.fotoDe)
    if (a.quitarFoto) f.append('quitar_foto', '1')
    return f
}

/**
 * Lo que el motor del boletín nacional necesita para las directoras adoptivas de Ajustes: guardar (agregar o editar,
 * con su foto) y quitar. Cada una devuelve los ajustes del mes tal como quedaron en la API.
 */
export const opcionesAdoptivas = (mes: () => string): NonNullable<BoletinNacionalOpciones['adoptivas']> => ({
    guardar: adoptiva => HttpService.request<ApiResponse<BoletinNacionalAjustes>>(API_ROUTES.REPORTS.BOLETIN_NACIONAL_ADOPTIVAS(adoptiva.id ?? undefined), {
        method: 'POST', body: formulario(mes(), adoptiva),
    }).then(res => res.data, motivo),
    quitar: id => HttpService.delete<ApiResponse<BoletinNacionalAjustes>>(`${API_ROUTES.REPORTS.BOLETIN_NACIONAL_ADOPTIVAS(id)}?year_month=${mes()}`)
        .then(res => res.data, motivo),
})

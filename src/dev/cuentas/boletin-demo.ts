/**
 * `GET /reports/unity` de mentira para el simulador de cuentas. Misma forma que la API real
 * (cada persona es un MonthlyReportDataDTO serializado) y cantidades de un boletín de unidad
 * real de septiembre; los nombres y las cifras son inventados.
 */

const NOMBRES: Record<string, string> = {
    p1: 'Rocío Fernández Ortega', p2: 'Adriana Salas Montoya', p3: 'Gabriela Ruiz Cárdenas',
    p4: 'Mariana Torres Villalobos', p5: 'Claudia Navarro Pineda', p6: 'Verónica Aguilar Soto',
    p7: 'Daniela Ibarra Luna', p8: 'Patricia Rangel Mora', p9: 'Fernanda Ochoa Becerra',
    p10: 'Lorena Castañeda Ruiz', p11: 'Silvia Méndez Quintero', p12: 'Karina Bautista Lara',
    p13: 'Norma Esquivel Duarte', p14: 'Alejandra Fuentes Rivas', p15: 'Mónica Lozano Treviño',
    p16: 'Teresa Vargas Ponce', p17: 'Elena Robles Guerra', p18: 'Yesenia Campos Delgado',
    p19: 'Irma Saldaña Peña', p20: 'Carmen Olvera Ríos', p21: 'Lucía Montes Herrera',
    p22: 'Paola Garza Medina', p23: 'Rebeca Solís Arenas', p24: 'Diana Cortés Valdez',
    p25: 'Beatriz Zamora León', p26: 'Sandra Ávila Cruz', p27: 'Julia Espinoza Mata',
    p28: 'Ana Karen Ríos Salgado', p29: 'Mayra Domínguez Ortiz', p30: 'Liliana Pacheco Nava',
    p31: 'Brenda Ochoa Lima', p32: 'Itzel Romero Gil', p33: 'Valeria Núñez Castro',
}

export const boletinUnidadDemo = (yearMonth: string | null) => {
    const ym = yearMonth ?? (() => { const d = new Date(); d.setDate(1); d.setMonth(d.getMonth() - 1); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}` })()
    const month = Number(ym.split('-')[1])
    const quarterEnd = month % 3 === 0
    const today = new Date()
    const thisMonth = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`
    let seq = 0

    const dto = (p: string, value: unknown, extra: Record<string, unknown> | null = null, more: Record<string, unknown> = {}) => ({
        id: `demo-${++seq}`, sponsor_id: 'demo-directora', sponsor_account: 'DEMO00', sponsor_name: 'Directora de ejemplo',
        report_date: `${ym}-01`, consultant_code: `DEMO${p.slice(1).padStart(4, '0')}`, photo_url: '', photo_filename: '',
        has_photo: false, alternative_photo_url: '', sponsored_id: `persona-${p}`, sponsored_name: NOMBRES[p],
        report_key_value: 'demo', report_value: value, sponsor_logo: '', extra_data: extra, ...more,
    })
    const star = (p: string, points: number) => dto(p, points, null, { points, missing_points: 0, is_quarter_end: quarterEnd })

    return {
        honor_roll: [dto('p1', 2310), dto('p2', 1845), dto('p3', 1402)],
        initiation_cut: { queens: [dto('p14', 3)], first_princesses: [dto('p5', 1), dto('p2', 1)], second_princesses: [] },
        points_club: {
            club_3000: [], club_2500: [], club_2000: [], club_1500: [], club_1000: [],
            club_900: [dto('p4', 1186), dto('p10', 935)],
            club_600: [dto('p6', 848), dto('p7', 805), dto('p8', 774), dto('p11', 713), dto('p12', 664), dto('p14', 638), dto('p15', 610)],
            club_300: [dto('p16', 575), dto('p18', 508), dto('p19', 398), dto('p28', 358), dto('p20', 326)],
        },
        road_to_success: {
            diqs: [], target_diqs: [],
            future_director: [dto('p2', 7, { activas: 7 }), dto('p6', 6, { activas: 6 }), dto('p11', 5, { activas: 5 })],
            target_future_director: [dto('p13', 4, { activas: 4 }), dto('p5', 3, { activas: 3 }), dto('p9', 2, { activas: 2 }), dto('p17', 1, { activas: 1 })],
        },
        new_beginnings: [
            dto('p30', `${ym}-04`, { nombre_completo_iniciadora: NOMBRES.p5 }), dto('p29', `${ym}-09`, { nombre_completo_iniciadora: NOMBRES.p2 }),
            dto('p31', `${ym}-12`, { nombre_completo_iniciadora: NOMBRES.p14 }), dto('p32', `${ym}-15`, { nombre_completo_iniciadora: NOMBRES.p14 }),
            dto('p33', `${ym}-21`, { nombre_completo_iniciadora: NOMBRES.p14 }),
        ],
        stars: quarterEnd
            ? { sapphire: [star('p7', 4120), star('p4', 3860), star('p14', 3640)], ruby: [star('p6', 5340)], diamond: [star('p1', 6480)], emerald: [star('p2', 8030)], pearl: [] }
            : { sapphire: [star('p7', 2890), star('p4', 2150), star('p14', 1380)], ruby: [star('p6', 3540)], diamond: [star('p1', 4420)], emerald: [star('p2', 5310)], pearl: [] },
        group_production: { l_pearl: [], l_emerald: [dto('p2', 8241)], l_diamond: [], l_ruby: [], l_sapphire: [dto('p11', 3910)] },
        pink_circle: {
            gold: [dto('p1', 21), dto('p4', 16), dto('p6', 14), dto('p8', 12)],
            vip: [dto('p2', 9)],
            pink: [dto('p12', 4), dto('p15', 3)],
            pink_target: [dto('p13', 2), dto('p20', 2), dto('p16', 1), dto('p19', 1), dto('p21', 1), dto('p22', 1)],
        },
        birthdays: [dto('p9', `${thisMonth}-03`), dto('p17', `${thisMonth}-11`), dto('p23', `${thisMonth}-18`), dto('p24', `${thisMonth}-24`), dto('p25', `${thisMonth}-29`)],
        anniversaries: [dto('p6', 8), dto('p26', 4), dto('p27', 1)],
    }
}

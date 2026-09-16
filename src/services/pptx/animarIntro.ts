import JSZip from 'jszip'

/**
 * Mete en el .pptx ya generado los efectos de entrada de las láminas de premiación.
 *
 * Las animaciones de PowerPoint no son magia del programa: son XML dentro de la
 * lámina (`<p:timing>` para los elementos, `<p:transition>` para el paso entre
 * láminas). PptxGenJS no las sabe escribir, pero el archivo se arma aquí en el
 * navegador, así que se abre el zip, se inyecta el XML y se vuelve a cerrar.
 *
 * El orden es el de una premiación: **3er lugar, 2do y 1ero**, y dentro de cada uno
 * **foto → nombre → rótulo del lugar**. Sale del `name` de cada forma, que el
 * renderer rellena con el `data_key` (`items[2].photo`, `items[0].name`…): por eso
 * no hace falta adivinar nada mirando posiciones.
 *
 * Si algo falla se devuelve el archivo tal cual. Un efecto de más no vale romperle
 * la descarga a nadie.
 */

const ENTRADA_MS = 600
const ENTRE_PERSONAS_MS = 600
const TRAS_LA_FOTO_MS = 220
const TRAS_EL_NOMBRE_MS = 170

type Forma = { id: number; item: number; papel: number }

/** Orden dentro de una persona: la foto, luego el nombre, luego lo demás. */
function papelDe(nombre: string): number {
    if (nombre.endsWith('.photo')) return 0
    if (nombre.endsWith('.name')) return 1
    return 2
}

function formasDe(xml: string): Forma[] {
    const formas: Forma[] = []
    const re = /<p:cNvPr id="(\d+)" name="([^"]*)"/g
    let m: RegExpExecArray | null
    while ((m = re.exec(xml)) !== null) {
        const item = /^items\[(\d+)\]\./.exec(m[2])
        if (item) formas.push({ id: Number(m[1]), item: Number(item[1]), papel: papelDe(m[2]) })
    }
    // 3º, 2º, 1º; y dentro de cada uno foto → nombre → rótulo.
    return formas.sort((a, b) => b.item - a.item || a.papel - b.papel)
}

function efecto(idc: number, spid: number, retardo: number): string {
    const [a, b, c, d, e, f] = [idc, idc + 1, idc + 2, idc + 3, idc + 4, idc + 5]
    return (
        `<p:par><p:cTn id="${a}" fill="hold"><p:stCondLst><p:cond delay="${retardo}"/></p:stCondLst><p:childTnLst>` +
        `<p:par><p:cTn id="${b}" fill="hold"><p:stCondLst><p:cond delay="0"/></p:stCondLst><p:childTnLst>` +
        `<p:par><p:cTn id="${c}" presetID="10" presetClass="entr" presetSubtype="0" fill="hold" grpId="0" nodeType="afterEffect">` +
        `<p:stCondLst><p:cond delay="0"/></p:stCondLst><p:childTnLst>` +
        `<p:set><p:cBhvr><p:cTn id="${d}" dur="1" fill="hold"><p:stCondLst><p:cond delay="0"/></p:stCondLst></p:cTn>` +
        `<p:tgtEl><p:spTgt spid="${spid}"/></p:tgtEl><p:attrNameLst><p:attrName>style.visibility</p:attrName></p:attrNameLst></p:cBhvr>` +
        `<p:to><p:strVal val="visible"/></p:to></p:set>` +
        `<p:animEffect transition="in" filter="fade"><p:cBhvr><p:cTn id="${e}" dur="${ENTRADA_MS}"/>` +
        `<p:tgtEl><p:spTgt spid="${spid}"/></p:tgtEl></p:cBhvr></p:animEffect>` +
        `<p:anim calcmode="lin" valueType="num"><p:cBhvr additive="base"><p:cTn id="${f}" dur="${ENTRADA_MS}" fill="hold"/>` +
        `<p:tgtEl><p:spTgt spid="${spid}"/></p:tgtEl><p:attrNameLst><p:attrName>ppt_y</p:attrName></p:attrNameLst></p:cBhvr>` +
        `<p:tavLst><p:tav tm="0"><p:val><p:strVal val="#ppt_y+0.035"/></p:val></p:tav>` +
        `<p:tav tm="100000"><p:val><p:strVal val="#ppt_y"/></p:val></p:tav></p:tavLst></p:anim>` +
        `</p:childTnLst></p:cTn></p:par></p:childTnLst></p:cTn></p:par></p:childTnLst></p:cTn></p:par>`
    )
}

function timingDe(formas: Forma[]): string {
    const pars: string[] = []
    let idc = 10
    formas.forEach((f, i) => {
        const retardo = i === 0 ? 0 : f.papel === 0 ? ENTRE_PERSONAS_MS : f.papel === 1 ? TRAS_LA_FOTO_MS : TRAS_EL_NOMBRE_MS
        pars.push(efecto(idc, f.id, retardo))
        idc += 8
    })
    return (
        '<p:timing><p:tnLst><p:par><p:cTn id="1" dur="indefinite" restart="never" nodeType="tmRoot"><p:childTnLst>' +
        '<p:seq concurrent="1" nextAc="seek"><p:cTn id="2" dur="indefinite" nodeType="mainSeq"><p:childTnLst>' +
        pars.join('') +
        '</p:childTnLst></p:cTn>' +
        '<p:prevCondLst><p:cond evt="onPrev" delay="0"><p:tgtEl><p:sldTgt/></p:tgtEl></p:cond></p:prevCondLst>' +
        '<p:nextCondLst><p:cond evt="onNext" delay="0"><p:tgtEl><p:sldTgt/></p:tgtEl></p:cond></p:nextCondLst></p:seq>' +
        '</p:childTnLst></p:cTn></p:par></p:tnLst></p:timing>'
    )
}

const CIERRE = '<p:clrMapOvr><a:masterClrMapping/></p:clrMapOvr>'
const TRANSICION = '<p:transition spd="slow"><p:fade/></p:transition>'

export async function animarIntro(pptx: Blob, laminas: number[]): Promise<Blob> {
    if (!laminas.length) return pptx
    try {
        const zip = await JSZip.loadAsync(pptx)
        for (const n of laminas) {
            const archivo = zip.file(`ppt/slides/slide${n}.xml`)
            if (!archivo) continue
            const xml = await archivo.async('string')
            const formas = formasDe(xml)
            if (!formas.length || xml.includes('<p:timing>')) continue
            zip.file(`ppt/slides/slide${n}.xml`, xml.replace(CIERRE, CIERRE + TRANSICION + timingDe(formas)))
        }
        return await zip.generateAsync({
            type: 'blob',
            mimeType: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
        })
    } catch {
        return pptx // un efecto de más no vale romper la descarga
    }
}

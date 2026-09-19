/**
 * Nombre propio con mayúscula inicial en cada palabra. Los reportes los traen EN MAYÚSCULAS, y
 * partir por `\w` (lo que hace `formatToTitleCase`) no ve las letras con acento: «ÁNGELES» salía
 * «ÁNgeles». Aquí se parte por espacios y guiones, que es donde de verdad empieza una palabra.
 */
export const titleCaseName = (name: string): string =>
    name
        .toLocaleLowerCase('es-MX')
        .replace(/(^|[\s-])(\p{L})/gu, (_, before: string, letter: string) => before + letter.toLocaleUpperCase('es-MX'))

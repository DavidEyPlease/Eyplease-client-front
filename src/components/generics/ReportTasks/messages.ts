// El PDF se genera con una sola petición síncrona al backend (sin progreso real),
// así que mientras esperamos rotamos mensajes que dan sentido a la espera. Para el
// PPTX no se usan: ahí el texto viene del paso real de construcción en el cliente.
export const PDF_ROTATING_MESSAGES = [
    'Reuniendo la información del mes...',
    'Maquetando las secciones...',
    'Aplicando la plantilla...',
    'Renderizando el documento...',
    'Dando los últimos toques...',
]

export const API_ROUTES = {
    SIGN_UP: {
        GET_RECOMMENDED_PLAN: '/sign-up/recommended-plan/{plan_key}',
        VALIDATE_EMAIL: '/sign-up/validate-email',
        VALIDATE_USERNAME: '/sign-up/validate-username',
        REGISTER: '/sign-up/register',
        REQUEST_ACCESS: '/sign-up/request-access',
    },
    SIGN_IN: '/sign-in',
    LOGOUT: '/logout',
    FORGOT_PASSWORD: {
        VALIDATE_EMAIL: '/forgot-password/send-email',
        RESET_PASSWORD: '/forgot-password/reset-password',
    },
    SIGN_URL: '/files/sign-url',
    GET_FILE: '/files/download',
    CHANGE_PASSWORD: '/users/change-password',
    UPDATE_USER: '/users',
    GET_UTIL_DATA: '/util-data',
    NOTIFICATIONS: '/users/notifications',
    READ_NOTIFICATIONS: '/users/notifications/mark-as-read',
    MY_CLIENTS: {
        LIST: '/customers/client',
        CREATE: '/customers/client',
        UPDATE: '/customers/client/{id}',
        DELETE: '/customers/client/{id}',
    },
    CUSTOM_SERVICES: {
        GET_REQUEST_SERVICES: '/request-services',
        CREATE: '/request-services',
        UPDATE: '/request-services/{id}',
        REQUEST_CORRECTION: '/request-services/{id}/correction',
        GET_ACTIVITY: '/request-services/{id}/activity',
        UPLOAD_FILES: '/request-services/{id}/attachments',
        DOWNLOAD_FILE: '/request-services/{itemId}/attachments/{fileId}/download',
        GET_FILES: '/request-services/{id}/attachments',
        DELETE: '/request-services/{id}',
        DELETE_ATTACHMENT: '/request-services/{id}/attachments/{attachmentId}',
    },
    CREATE_EVENT: '/events',
    UPDATE_EVENT: '/events/{id}',
    GET_EVENTS: '/events',
    GET_EVENT_FILES: '/events/{id}/files',
    DELETE_EVENT: '/events/{id}',
    TRAININGS: {
        LIST: '/trainings',
        FILTER: '/trainings/filter',
        DETAIL: '/trainings/{id}',
    },
    POSTS: {
        LIST: '/posts',
        MY_BIRTHDAY: '/posts/my-birthday',
        STATS_MONTH: '/posts/stats/month',
        COVERAGE: '/posts/stats/coverage',
        MARK_AS_SENT: '/posts/{id}/sent',
        REGENERATE: '/posts/{id}/regenerate',
    },
    SPONSORED: {
        GALLERY: '/sponsored',
        GET_AUTOCOMPLETE_LIST: '/sponsored/autocomplete',
        UPDATE: '/sponsored/{id}',
    },
    SPONSORSHIP: {
        REMOVE: '/sponsorships/{id}',
        UPDATE: '/sponsorships/{id}',
    },
    TOOLS: {
        LIST: '/tools',
        SAVED: '/tools/saved',
        SAVE: '/tools/{id}/save',
        REMOVE_SAVED: '/tools/saved/{id}',
    },
    INDICATORS: {
        BUSINESS: '/indicators/business',
    },
    CHALLENGES: {
        LIST: '/challenges',
        SUGGESTIONS: '/challenges/suggestions',
        DETAIL: '/challenges/{id}',
        AWARD: '/challenges/{id}/awards',
    },
    REPORTS: {
        PREFERENCES: '/reports/preferences',
        /* La data cruda de cada sección (la misma del PDF), sin diseño */
        UNITY: '/reports/unity',
        /* El boletín dinámico (el cierre del mes contado cómo pasó) y lo que la Directora decide de él */
        BOLETIN_DINAMICO: '/reports/boletin-dinamico',
        BOLETIN_DINAMICO_AJUSTES: '/reports/boletin-dinamico/ajustes',
        /* El boletín nacional interactivo y el mensaje de la Directora Nacional para su junta */
        BOLETIN_NACIONAL: '/reports/boletin-nacional',
        BOLETIN_NACIONAL_AJUSTES: '/reports/boletin-nacional/ajustes',
        NATIONAL: '/reports/national',
        LIST_UPLOADS: '/reports/uploads',
        UPLOAD: '/reports/upload',
        GENERATE_REPORT_PDF: '/reports/generate-pdf/{templateId}/{reportType}',
        GENERATE_REPORT_PPTX: '/reports/generate-pptx/{templateId}/{reportType}',
        GENERATE_ANNUAL_REPORT: '/reports/generate-annual-report',
    },
    CHAT: {
        SEND_SERVICES_MESSAGE: '/chat/services',
        CONVERSATIONS: '/chat/conversations',
        CONVERSATION_MESSAGES: '/chat/conversations/{id}/messages',
        DELETE_CONVERSATION: '/chat/conversations/{id}',
    },
    /** «Invite a una Directora»: su liga para recomendar y a quién ha recomendado */
    REFERRALS: {
        MINE: '/referrals/mine',
    },
    BILLING: {
        OVERVIEW: '/billing/overview',
        PAYMENTS: '/billing/payments',
        UPLOAD_RECEIPTS: '/billing/receipts',
        CARD_CHECKOUT: '/billing/card-checkout',
        CARD_AUTOMATION: '/billing/card-automation',
        /** Subir de plan con tarjeta: cuánto cuesta hoy (GET ?plan=), la liga de pago (POST) y la confirmación al volver */
        PLAN_UPGRADE: '/billing/plan-upgrade',
        PLAN_UPGRADE_CONFIRM: '/billing/plan-upgrade/confirm',
        /** Contratar el Plan Standard de consultora con tarjeta (cotiza, abre Stripe) y confirmarlo al volver */
        STANDARD: '/billing/standard',
        STANDARD_CONFIRM: '/billing/standard/confirm',
    },
    /** «Tu estrategia» (plan Standard de consultora): su estrategia del mes, su inventario y lo que vende a sus clientas */
    CONSULTANT: {
        STRATEGY: '/consultant/strategy',
        /** Una lámina de su estrategia con su logo (JPEG; pide sesión) */
        STRATEGY_IMAGE: '/consultant/strategy/images/{key}',
        INVENTORY: '/consultant/inventory',
        /** «Ya lo revisé»: su revisión de una sola vez */
        INVENTORY_REVIEW: '/consultant/inventory/review',
        /** Agregar algo que no sale en sus pedidos */
        INVENTORY_ITEMS: '/consultant/inventory/items',
        /** Corregir «te quedan» de un producto */
        INVENTORY_ITEM: '/consultant/inventory/items/{sku}',
        /** «Ya me compró»: lista paginada (con `client_customer_id`, la de una clienta) y anotar */
        SALES: '/consultant/sales',
        SALE: '/consultant/sales/{id}',
    },
    VERIFICATION_TEMPORARY_CODE: '/verification-temporary-code',
    DASHBOARD: '/dashboard',
    CANVA: {
        AUTHORIZE: '/canva/authorize',
        DISCONNECT: '/canva/disconnect',
    }
}
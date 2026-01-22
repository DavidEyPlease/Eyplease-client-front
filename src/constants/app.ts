import { MenuItem, MenuKeys } from "@/interfaces/common"
import { PermissionKeys } from "@/interfaces/permissions"
import { MainPostSectionTypes } from "@/interfaces/posts"
import { UserRequestStatusTypes } from "@/interfaces/requestService"
import { ToolSectionTypes } from "@/interfaces/tools"
import { TrainingCategoryTypes, TrainingFilterTypes } from "@/interfaces/trainings"

export const APP_ROUTES = {
    AUTH: {
        SIGN_UP: '/auth/sign-up',
        SIGN_IN: '/auth/sign-in',
        FORGOT_PASSWORD: '/auth/forgot-password',
        FORGOT_PASSWORD_VERIFICATION_CODE: '/auth/forgot-password/verification-code',
        CHANGE_PASSWORD: '/auth/change-password',
        SUCCESS_REGISTER: '/auth/success-register',
    },
    HOME: {
        INITIAL: '/dashboard',
        NEWSLETTER: '/newsletter',
        PROFILE: '/profile',
        GALLERY: '/gallery',
        MY_CLIENTS: '/my-clients',
    },
    TRAININGS: {
        LIST: '/trainings',
        FILTER: '/trainings/:sectionKey/filter',
    },
    POSTS: {
        LIST: '/posts',
    },
    REPORTS: '/reports',
    HELP_CENTER: '/help-center',
    PAYMENTS_AND_BILLS: '/payments-and-bills',
    CHANGE_PASSWORD: '/change-password',
    FAQ: '/faq',
    HELP_VIDEOS: '/help-videos',
    NEWS: '/news',
    NEWS_BY_SECTION: '/news/:filter',
    TOOLS: '/tools',
    SERVICES: '/services',
    EVENTS: '/events',
    SUBSCRIPTION: '/subscription',
    CUSTOM_DETAIL: '/custom-detail',
    EVENT_DETAIL: '/event-detail/:id',
    EVENT_DETAIL_ONLINE: '/event-detail-online',
    CREATE_EVENT: '/create-event',
    NEW_CONSULTING: '/new-consulting-gallery',
}

export const SESSION_KEY = 'eyWebPleaseToken'

export const SIDEBAR_ITEMS: MenuItem[] = [
    {
        key: MenuKeys.HOME,
        path: APP_ROUTES.HOME.INITIAL,
        label: 'Inicio',
        icon: 'home',
    },
    {
        key: MenuKeys.GALLERY,
        label: 'Galería',
        path: APP_ROUTES.HOME.GALLERY,
        requiredPermission: true,
        permissionKeys: [PermissionKeys.GALLERY],
        icon: 'gallery',
    },
    {
        key: MenuKeys.TOOLS,
        label: 'Herramientas',
        path: APP_ROUTES.TOOLS,
        requiredPermission: true,
        permissionKeys: [PermissionKeys.TOOLS],
        icon: 'tools',
    },
    {
        key: MenuKeys.POSTS,
        label: 'Noticias',
        path: APP_ROUTES.POSTS.LIST,
        requiredPermission: true,
        permissionKeys: [PermissionKeys.POSTS],
        icon: 'posts',
    },
    {
        key: MenuKeys.SERVICES,
        label: "Servicios",
        path: APP_ROUTES.SERVICES,
        icon: 'services',
        requiredPermission: true,
        permissionKeys: [PermissionKeys.SERVICES, PermissionKeys.EVENTS],
    },
    {
        key: MenuKeys.MY_CLIENTS,
        label: "Mis clientes",
        path: APP_ROUTES.HOME.MY_CLIENTS,
        icon: 'myClients',
        requiredPermission: true,
        permissionKeys: [PermissionKeys.MY_CLIENTS]
    },
    {
        key: MenuKeys.TRAININGS,
        label: "Entrenamientos",
        path: APP_ROUTES.TRAININGS.LIST,
        icon: 'training',
        requiredPermission: true,
        permissionKeys: [PermissionKeys.TRAININGS]
    },
    {
        key: MenuKeys.UPLOAD_REPORTS,
        label: "Reportes",
        path: APP_ROUTES.REPORTS,
        icon: 'reports',
        requiredPermission: true,
        permissionKeys: [PermissionKeys.REPORTS_UPLOAD]
    },
]

export const MAP_USER_REQUEST_STATUS: Record<UserRequestStatusTypes, { label: string; classes: string, bgBorder: string }> = {
    [UserRequestStatusTypes.UNASSIGNED]: {
        label: 'Pendiente',
        classes: 'bg-warning text-white',
        bgBorder: 'bg-warning',
    },
    [UserRequestStatusTypes.IN_PROGRESS]: {
        label: 'En proceso',
        classes: 'bg-warning text-white',
        bgBorder: 'bg-warning',
    },
    [UserRequestStatusTypes.COMPLETED]: {
        label: 'Entregado',
        classes: 'bg-primary text-white',
        bgBorder: 'bg-primary',
    },
    [UserRequestStatusTypes.PENDING_CORRECTION]: {
        label: 'En correción',
        classes: 'bg-red-500 text-white',
        bgBorder: 'bg-red-500',
    },
    [UserRequestStatusTypes.READY_FOR_REVIEW]: {
        label: 'Para revisión',
        classes: 'bg-secondary text-white',
        bgBorder: 'bg-secondary',
    },
    [UserRequestStatusTypes.READY_FOR_PUBLISH]: {
        label: 'Publicada',
        classes: 'bg-blue-500 text-white',
        bgBorder: 'bg-blue-500',
    }
}

export const EVENT_TYPES_LABEL = {
    online: 'Online',
    presential: 'Presencial',
}

export const TRANSLATE_MAP_CATEGORIES = {
    [TrainingCategoryTypes.SALES]: 'Ventas',
    [TrainingCategoryTypes.MARKETING]: 'Marketing',
    [TrainingFilterTypes.ALL]: 'Todos',
    [TrainingFilterTypes.RECENT]: 'Recientes',
}

export const MAP_STATUS_USER_REQUEST_SERVICES = {
    [UserRequestStatusTypes.UNASSIGNED]: 'Pendiente',
    [UserRequestStatusTypes.IN_PROGRESS]: 'En proceso',
    [UserRequestStatusTypes.READY_FOR_REVIEW]: 'Revisión',
    [UserRequestStatusTypes.READY_FOR_PUBLISH]: 'Publicado',
    [UserRequestStatusTypes.COMPLETED]: 'Entregado',
    [UserRequestStatusTypes.PENDING_CORRECTION]: 'En corrección',
}

export const MAP_TOOLS_SECTIONS = {
    [ToolSectionTypes.STAY_INFORMED]: 'Entérate Ya',
    [ToolSectionTypes.EXPLAIN]: 'Explíca',
    [ToolSectionTypes.LEARN]: 'Aprende',
    [ToolSectionTypes.PROPOSALS]: 'Propuestas',
    [ToolSectionTypes.PRODUCTS]: 'Productos',
    [ToolSectionTypes.GET_STARTED]: 'Inicia',
}

export const MAP_MAIN_POSTS_SECTIONS = {
    [MainPostSectionTypes.CLIENTS]: 'Clientes',
    [MainPostSectionTypes.DIRECTORS]: 'Directoras',
    [MainPostSectionTypes.UNITY]: 'Unidad',
}

export const BROWSER_EVENTS = {
    CUSTOMER_CLIENTS_LIST_UPDATED: 'customer-clients-list-updated',
    GALLERY_LIST_UPDATED: 'gallery-list-updated',
    POSTS_LIST_UPDATED: 'posts-list-updated',
    UPLOAD_REPORT: 'upload-report',
    CLEAR_FILE_UPLOADER: 'clear-file-uploader'
}
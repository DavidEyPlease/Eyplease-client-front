export interface IPermission {
    name: string
    permission_key: PermissionKeys
    is_active: boolean
    is_submodule: boolean
    parent_module_key: PermissionKeys | null
    custom_permissions: Array<{ key: PermissionKeys, label: string }>
}

export enum PermissionKeys {
    POSTS = 'posts',
    MY_CLIENTS = 'customers',
    GALLERY = 'gallery',
    PROFILE = 'profile',
    SERVICES = 'services',
    TOOLS = 'tools',
    UNIT_NEWSLETTER = 'unit_newsletter',
    NATIONAL_NEWSLETTER = 'national_newsletter',
    TRAININGS = 'trainings',
    REPORTS_UPLOAD = 'reports_upload',
    EVENTS = 'events',
    CUSTOM_SERVICES = 'custom_services',

    //Tools sections
    TOOLS_STAY_INFORMED = 'stay_informed',
    TOOLS_LEARN = 'learn',
    TOOLS_EXPLAIN = 'explain',
    TOOLS_PRODUCTS = 'products',
    TOOLS_PROPOSALS = 'proposals',
    TOOLS_GET_STARTED = 'get_started',

    // Posts sections
    POSTS_CLIENTS = 'clients',
    POSTS_DIRECTORS = 'directors',
    POSTS_UNITY = 'unity',

    STARS = 'stars',
    NATIONAL_STARS = 'national_stars',
    HONOR_ROLL = 'honor_roll',
    PINK_CIRCLE = 'pink_circle',
    BIRTHDAYS = 'birthdays',
    NATIONAL_BIRTHDAYS = 'national_birthdays',
    NEW_BEGGININGS = 'new_beginnings',
    ROAD_TO_SUCCESS = 'road_to_success',
    ANNIVERSARIES = 'anniversaries',
    NATIONAL_ANNIVERSARIES = 'national_anniversaries',
    DIQ = 'diq',
    SALES_CUT = 'sales_cut',
    INITIATION_CUT = 'initiation_cut',
    UNIT_CLUB = 'target_unit_club',
    CUSTOMER_BIRTHDAYS = 'customer_birthdays',
    EARLY = 'early',
}
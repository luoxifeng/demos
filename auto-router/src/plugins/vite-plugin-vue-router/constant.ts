
export const resolvedVirtualId = (id = '') => `\0${id}`

export const __VOID_CONFLICT__ = `__void_conflict__${Date.now()}`

export const countSlashRE = /\//g

export const __CASE_SENSITIVE__ = '__CASE_SENSITIVE__'

export const __ROUTE_STYLE__ = '__ROUTE_STYLE__'

export const __original__ = `__x_original_x__`

export const __IMPORT_ROUTE_NAME__ = `__import_route_$__`

export const __IMPORT_ROUTE_CONFIG_NAME__ = `__import_route_config__`

export const __IMPORT_COMPONENT_NAME__ = `__import_component__`

export const __PROXY_VUE_ID_VIRTUAL__ = resolvedVirtualId('virtual:proxy-vue')

export const __PROXY_VUE_ROUTER_ID_VIRTUAL__ = resolvedVirtualId('virtual:proxy-vue-router')

export const __ROUTES_ENTRY_ID_VIRTUAL__ = resolvedVirtualId('virtual:routes-entry')

export const __RUNTIME_ID_VIRTUAL__ = resolvedVirtualId(`virtual:runtime-${__VOID_CONFLICT__}`)

export const __INTERNAL_IDS_MAP__ = new Map()

__INTERNAL_IDS_MAP__.set(__ROUTES_ENTRY_ID_VIRTUAL__, __ROUTES_ENTRY_ID_VIRTUAL__)
__INTERNAL_IDS_MAP__.set(__RUNTIME_ID_VIRTUAL__, __RUNTIME_ID_VIRTUAL__)
import { __CASE_SENSITIVE__, __ROUTE_STYLE__ } from './constant'

import type { CustomBlock, VueRouteBase, VueRoute } from './types'

export function createRuntime() {
  const dynamicRouteRE = /^\[(.+)\]$/
  const cacheAllRouteRE = /^\[\.{3}(.*)\]$/
  const replaceDynamicRouteRE = /^\[(?:\.{3})?(.*)\]$/

  const nuxtDynamicRouteRE = /^_(.*)$/
  const nuxtCacheAllRouteRE = /^_$/

  function isDynamicRoute(routePath: string, nuxtStyle = false) {
    return nuxtStyle ? nuxtDynamicRouteRE.test(routePath) : dynamicRouteRE.test(routePath)
  }

  function isCatchAllRoute(routePath: string, nuxtStyle = false) {
    return nuxtStyle ? nuxtCacheAllRouteRE.test(routePath) : cacheAllRouteRE.test(routePath)
  }

  function normalizeCase(str: string, caseSensitive: boolean) {
    if (!caseSensitive) return str.toLocaleLowerCase()
    return str
  }

  function normalizeName(name: string, isDynamic: boolean, nuxtStyle = false) {
    if (!isDynamic) return name

    return nuxtStyle ? name.replace(nuxtDynamicRouteRE, '$1') || 'all' : name.replace(replaceDynamicRouteRE, '$1')
  }

  function prepareRoutes(routes: VueRoute[], parent?: VueRoute) {
    for (const route of routes) {
      if (route.name) route.name = route.name.replace(/-index$/, '')

      if (parent) route.path = route.path?.replace(/^\//, '')

      if (route.children) route.children = prepareRoutes(route.children, route)

      if (route.children?.find((c: any) => c.name === route.name)) delete route.name

      route.props = true

      delete route.rawRoute

      if (route.customBlock) {
        Object.assign(route, route.customBlock || {})
        delete route.customBlock
      }

      // Object.assign(route, ctx.options.extendRoute?.(route, parent) || {})
    }

    return routes
  }

  function computeRoutes(pageRoutes: any[]): VueRoute[] {
    const caseSensitive = __CASE_SENSITIVE__ as unknown as boolean
    const nuxtStyle = __ROUTE_STYLE__ as unknown as boolean
    const routes: VueRouteBase[] = []

    pageRoutes.forEach((page) => {
      const route: VueRouteBase = {
        name: '',
        path: '',
        ...page
      }
      const pathNodes = page.rawRoute.split('/')

      let parentRoutes = routes

      for (let i = 0; i < pathNodes.length; i++) {
        const node = pathNodes[i]

        const isDynamic = isDynamicRoute(node, nuxtStyle)
        const isCatchAll = isCatchAllRoute(node, nuxtStyle)
        const normalizedName = normalizeName(node, isDynamic, nuxtStyle)
        const normalizedPath = normalizeCase(normalizedName, caseSensitive)

        route.name += route.name ? `_${normalizedName}` : normalizedName

        // Check parent exits
        const parent = parentRoutes.find((parent) => {
          return pathNodes.slice(0, i + 1).join('/') === parent.rawRoute
        })

        if (parent) {
          // Make sure children exist in parent
          parent.children = parent.children || []
          // Append to parent's children
          parentRoutes = parent.children
          // Reset path
          route.path = ''
        } else if (normalizedPath === 'index') {
          if (!route.path) route.path = '/'
        } else if (normalizedPath !== 'index') {
          if (isDynamic) {
            route.path += `/:${normalizedName}`
            // Catch-all route
            if (isCatchAll) {
              if (i === 0)
                // root cache all route include children
                route.path += '(.*)*'
              // nested cache all route not include children
              else route.path += '(.*)'
            }
          } else {
            route.path += `/${normalizedPath}`
          }
        }
      }

      parentRoutes.push(route)
    })

    let finalRoutes = prepareRoutes(routes)

    return finalRoutes
  }

  return {
    computeRoutes
  }
}

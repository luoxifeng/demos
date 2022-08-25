const vueRoutes = [] as any

export function addRoute(component) {
  return (route = {}) => {
    route.component = component
    vueRoutes.push(route)
  }
}

/**
 * 对路由进行归并处理
 */
export function mergeRoutes() {
  return vueRoutes
}

export function registerAllRouter(router: any) {
  mergeRoutes().forEach((route) => {
    router.addRoute(route)
  })
  return router
}

export function registerRouter(router: any) {
  mergeRoutes().forEach((route) => {
    router.addRoute(route)
  })
  return router
}

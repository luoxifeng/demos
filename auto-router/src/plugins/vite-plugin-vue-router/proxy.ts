import { addOriginal, stringify } from './utils'

export function proxyVue(vueLibId: string, routeEntryId: string) {
  const newId = addOriginal(vueLibId)
  return `
    import { createApp as __createApp__ } from ${stringify(newId)}
    import { createRouter } from 'vue-router'
    import routes from ${stringify(routeEntryId)}

    const createApp = new Proxy(__createApp__, {
      apply(target, thisArg, argArray) {
        console.log('vue createApp Proxy：', argArray)

        const app = target.apply(thisArg, argArray)
        const router = createRouter({
          routes
        })

        app.use(router)

        return app
      }
    })

    export * from ${stringify(newId)}
    export {
      createApp
    }
  `
}

export function proxyVueRouter(vueRouterLibId: string, routeEntryId: string) {
  const newId = addOriginal(vueRouterLibId)
  return `
    import { createRouter as __createRouter__ } from ${stringify(newId)}
    import routes from ${stringify(routeEntryId)}

    const createRouter = new Proxy(__createRouter__, {
      apply(target, thisArg, argArray) {
        console.log('vue-router createRouter Proxy：', argArray)

        argArray[0] = argArray[0] || {}
        argArray[0].routes = (argArray[0].routes || []).concat(routes)

        console.log('vue-router createRouter Proxy routes：', argArray[0].routes)

  
        return target.apply(thisArg, argArray)
      }
    })

    export * from ${stringify(newId)}
    export {
      createRouter
    }
  `
}




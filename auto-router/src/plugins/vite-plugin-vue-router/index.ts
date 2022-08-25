import { Plugin } from 'vite'
import path from 'path'
import fs from 'fs-extra'
import globby from 'globby'
import Route from './route'
import { handlerHMR } from './hmr'
import {
  getExcludes,
  resolvedVirtualId,
  addQuery,
  parseQuery,
  stringify,
  addOriginal,
  hasOriginal,
  notOriginal
} from './utils'
import type { UserOptions } from './types'
// import { resolveOptions } from './options'
import Context from './context'
import { proxyVue, proxyVueRouter } from './proxy'
import { 
  __PROXY_VUE_ID_VIRTUAL__,
  __PROXY_VUE_ROUTER_ID_VIRTUAL__, 
  __ROUTES_ENTRY_ID_VIRTUAL__,
  __INTERNAL_IDS_MAP__,
  __RUNTIME_ID_VIRTUAL__,
  __VOID_CONFLICT__
} from './constant'

function resolveByDirName(target = '') {
  return path.join(__dirname, target)
}

const RUNTIME_PATH = resolveByDirName('./runtime')

export default function vitePluginVueRouter(userOptions: UserOptions): Plugin {
  const virtualVueId = 'virtual:Proxy_createApp'
  const resolvedVirtualVueId = '\0' + virtualVueId
  const virtualVueRouterId = 'virtual:Proxy_createRouter'
  const resolvedVirtualVueRouterId = `\0${virtualVueRouterId}`


  let ctx: Context

  const idMap = new Map()
  let isDev = true

  return {
    name: 'vite-plugin-vue-router',
    enforce: 'pre',
    async configResolved(config) {
      isDev = config.command === 'serve'
      ctx = new Context(userOptions, config.root, config.command)

      await ctx.searchGlob()
    },
    resolveId(id, importer) {
      if (Route.isRouteId(id)) {
        return Route.resolvedId(id)
      }

      // route entry id
      if (id.includes(__ROUTES_ENTRY_ID_VIRTUAL__)) return id

      // internal ids map
      if (__INTERNAL_IDS_MAP__.has(id)) return __INTERNAL_IDS_MAP__.get(id)

      // full auto
      if (userOptions.auto === 'full') {
      } else if (userOptions.auto === 'half') {
        if (ctx.isDev) {
          if (id.includes('/.vite/deps/vue-router') && notOriginal(id)) {
            return addQuery(__PROXY_VUE_ROUTER_ID_VIRTUAL__, 'id', id)
          }
        } else {
          if (id === 'vue-router') {
            if (importer !== virtualVueRouterId) {
              return addQuery(__PROXY_VUE_ROUTER_ID_VIRTUAL__, 'id', id)
            }
          }
        }
      }
    },
    async load(id) {
      const { moduleId, queryId } = parseQuery(id)

      // proxy vue api apply
      if (moduleId === __PROXY_VUE_ID_VIRTUAL__ && queryId) {
        return proxyVue(queryId, __ROUTES_ENTRY_ID_VIRTUAL__)
      }

      // proxy vue-router api apply
      if (moduleId === __PROXY_VUE_ROUTER_ID_VIRTUAL__ && queryId) {
        return proxyVueRouter(queryId, __ROUTES_ENTRY_ID_VIRTUAL__)
      }

      // genrate route entry
      if (moduleId === __ROUTES_ENTRY_ID_VIRTUAL__) {
        return ctx.resolveRoutes(queryId)
      }

      // generate rumtime util api
      if (moduleId === __RUNTIME_ID_VIRTUAL__) {
        return ctx.generateRuntime()
      }

      let code = ''
      /**
       * 处理编译出的路由聚合入口
       */
      if (id === Route.resolvedEntryId) {
        // 重新解析
        Route.clear()
        /**
         * 扫描文件
         */
        const p = path.join(process.cwd(), 'src/pages/**/*.vue')
        const files = globby.sync([p])
        if (files.length) {
          for (const file of files) {
            const route = Route.ensure(file)
            // 读取route信息
            await route.read()
            route.record()
          }
          const routes = Route.routes()
          code = routes.map((t) => t.import).join('\n')
          return code
        } else {
          return code
        }
      }

      /**
       * 处理编译出的单个路由
       */
      if (Route.has(id)) {
        /**
         * 获取路由信息拼单个路由处理的代码
         */
        const route = Route.get(id)
        const _id = addOriginal(addQuery(route.path, 'vue&type=route&index=0'))
        let component = `const component = () => import(${stringify(route.path)})`
        if (route.attr.sync) {
          component = `import component from ${stringify(route.path)}`
        }

        return `
          import config from ${stringify(_id)}
          import { registerRoute } from '${RUNTIME_PATH}'
          ${component}
          config.component = component
          registerRoute(config)
          
          const filePath = '${route.path}'
          console.log(config, '路由配置')
          // ${route}
        `
      }
      if (id.includes('vue&type=route') && notOriginal(id)) {
        return 'export default () => {}'
      }
    },
    transform(code, id) {
      // if (id === resolvedVirtualRouteEntryId) {
      //   this.error({
      //     id,
      //     // frame: 'import jj from "./api.ts"',
      //     // code: "import 'virtual:compile(/Users/guoying/workspace/crd-fe/packages/auto-router/src/views/Detail/Index.vue)'",
      //     message: ` 自定义路由块中1115551，`,
      //   }, 30)
      // }
      // if (id.includes('type=route')) {
      //   if (!id.includes('f13')) return 'export default () => {}'
      //   const componentPath = id.replace(/\?.*/, '')
      //   const res = compiler.parse(fs.readFileSync(componentPath).toString())
      //   const routerBlock = res.descriptor.customBlocks.find((t) => t.type === 'router')
      //   const attrs = routerBlock?.attrs || {}
      //   let defaultOption = '{'
      //   if (attrs.parent) {
      //     defaultOption += `parent: '${attrs.parent}',`
      //   }
      //   defaultOption += '}'
      //   /**
      //    * 默认是异步路由，为了优化资源
      //    */
      //   const componentName = `__ROUTE_COMPONENT__`
      //   const asyncRouter = attrs.async !== 'false'
      //   let componentImport = ''
      //   if (asyncRouter) {
      //     componentImport = `const ${componentName} = () => import('${componentPath}')`
      //   } else {
      //     componentImport = `import ${componentName} from '${componentPath}'`
      //   }
      //   code = `
      //     import { addRoute } from './plugins/vite-plugin-vue-router'
      //     ${componentImport}
      //     const __ADD_ROUTE__ = addRoute(${componentName}, ${defaultOption})
      //     ${code.trim()}
      //   `
      //   return code
      // }
      // if (id.endsWith('main.ts')) {
      //   code = `
      //     import './Test.vue?vue&type=router&index=0&lang.router&f13'
      //     ${code}
      //   `
      //   // import './Test2.vue?vue&type=router&index=0&lang.router&f13'
      //   return code
      // }
      // return code
    },
    configureServer(server) {
      ctx.setupViteServer(server)
    }
  }
}

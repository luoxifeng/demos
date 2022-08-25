import { Plugin } from 'vite'
import path from 'path'
import * as compiler from '@vue/compiler-sfc'
import fs from 'fs-extra'
import globby from 'globby'
import * as qs from 'querystring'
import * as cheerio from 'cheerio'
import { Parser } from 'htmlparser2'
export type Config = {
  auto: 'full' | 'half' | 'none'
  exclude?: string | string[]
}

function resolveByDirName(target = '') {
  return path.join(__dirname, target)
}

const RUNTIME_PATH = resolveByDirName('./runtime')

function getExcludes(exclude: string | string[]) {
  return [exclude]
    .flat()
    .filter(Boolean)
    .map((t) => `!${path.join(process.cwd(), t)}`)
}
// function Hh() {
//   console.log()
// }
// var p = new Proxy(Hh, {
//   apply(target, thisArg, argArray) {
//     console.log(target, thisArg, argArray)
//   },
//   construct(target, argArray, newTarget) {
//     this.deleteProperty

//     console.log(target, thisArg, argArray)
//   },
// })
// p()

export default function vitePluginVueRouter(cfg: Config): Plugin {
  const virtualVueId = 'virtual:Proxy_createApp'
  const resolvedVirtualVueId = '\0' + virtualVueId
  const virtualVueRouterId = 'virtual:Proxy_createRouter'
  const resolvedVirtualVueRouterId = `\0${virtualVueRouterId}`
  const virtualRouteEntryId = 'virtual:compiler_route(entry)'
  const resolvedVirtualRouteEntryId = `\0${virtualRouteEntryId}`

  const excludes = getExcludes(cfg.exclude)

  const idMap = new Map()
  idMap.set(virtualRouteEntryId, resolvedVirtualRouteEntryId)
  const codeMap = new Map()
  let isDev = true
  let dealed = false

  return {
    name: 'vite-plugin-vue-router',
    enforce: 'pre',
    configResolved(config) {
      isDev = config.command === 'serve'
    },
    resolveId(source, importer) {
      let id = ''
      if (idMap.has(source)) {
        id = idMap.get(source)
        return id
      }
      if (cfg.auto === 'half') {
        if (isDev) {
          if (source.includes('/.vite/deps/vue-router') && !source.includes('from=auto')) {
            // 缓存vue-router原始id
            idMap.set(virtualVueRouterId, source)
            return resolvedVirtualVueRouterId
          }
        } else {
          if (source === 'vue-router') {
            if (importer !== virtualVueRouterId) {
              idMap.set(virtualVueRouterId, source)
              return resolvedVirtualVueRouterId
            }
          }
        }
      }
    },
    async load(id) {
      let code = ''
      /**
       * 重写vue-router的引用
       * 进行代理
       */
      if (id === resolvedVirtualVueRouterId) {
        // 根据缓存获取vue-router原始的id
        const oldId = idMap.get(virtualVueRouterId) as string
        /**
         * 加标记为了区分来源，因原始的vue-router已经被重写，
         * 原始的id会被返回下面进行代理的代码
         * 故需要更换一个id，在resolveId钩子会判断来源
         * 让新id解析到vue-router真实的id，便会返回真实的内容
         */
        const newId = oldId.includes('?') ? `${oldId}&from=auto` : `${oldId}?from=auto`
        code = `
          // 编译得到的所有自动路由的虚拟入口, 内部进行各个路由的添加
          import '${virtualRouteEntryId}'
          /**
           * 运行时代码对所有编译的路由进行组合，分类
           * /
          import { routes } from '${RUNTIME_PATH}'

          /**
           * 引入原始的createRouter对createRouter进行代理，
           * 拦截router实例的创建，把编译得到的路由进行合并
           * 这样便可以实现不对原始代码做任何改变的情况下，
           * 静默地完成编译路由自动注册
           * /
          import { createRouter as __createRouter } from '${newId}'
          const createRouter = new Proxy(__createRouter, {
            apply(target, thisArg, argArray) {
              console.log('vue-router Proxy：', argArray)
              argArray.routes = (argArray.routes || []).concat(routes)

              return target.apply(thisArg, argArray)
            }
          })
          // 为了保持vue-roouter功能的完整，导出所有方法
          export * from '${newId}'
          export {
            createRouter
          }
        `
        return code
      }

      // const syncImports = []
      // const asyncImports = []
      // function joinCode() {
      //   return [
      //     `import { formatRoutes, addCompilerRoute } from '${RUNTIME_PATH}'`,
      //     syncImports.join('\n'),
      //     `const COMPONENTS_MAP = {}`,
      //     asyncImports.join('\n')
      //   ].join('\n')
      // }

      /**
       * 处理编译出的路由聚合入口
       */
      if (id === resolvedVirtualRouteEntryId) {
        /**
         * 扫描文件
         */
        const p = path.join(process.cwd(), 'src/Test.vue')
        const files = globby.sync([p, ...excludes])

        if (files.length) {
          for (const file of files) {
            const buffer = await fs.readFile(file)
            const $ = cheerio.load(buffer.toString())
            const routeString = $('body > route').toString()
            // 存在 route 标签
            if (routeString) {
              const singleRouteId = `virtual:compiler_route(${file})`
              idMap.set(singleRouteId, `\0${singleRouteId}`)
              code += `import '${singleRouteId}'`

              const route = { id: singleRouteId }
              codeMap.set(idMap.get(singleRouteId), route)
              // const parser = new Parser({
              //   onopentag() {},
              //   onattribute(attr, value) {


              //     console.log(attr, value)
              //   },
              //   ontext(text) {
              //     console.log(text)
              //   }
              // })
              // parser.write(routeString)
              // parser.end()
            }
          }
          return code
        }
        // code = joinCode()
      }

      /**
       * 处理编译出的单个路由
       */
      if (codeMap.has(id)) {
        /**
         * 获取路由信息拼单个路由处理的代码
         */
        code = codeMap.get(id)
        return 'const hh = 12'
      }
    },
    transform(code, id) {
      // if (id.includes('type=router')) {
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
    }
  }
}

export * from './routes'

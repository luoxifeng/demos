import fs from 'fs-extra'
import { parse } from '@vue/compiler-sfc'
import deepEqual from 'deep-equal'
import { load, Cheerio, Element } from 'cheerio'
import { resolvedVirtualId, addQuery, stringify, addOriginal, resolveImportMode } from './utils'
import {
  __ROUTES_ENTRY_ID_VIRTUAL__,
  __IMPORT_ROUTE_NAME__,
  __IMPORT_COMPONENT_NAME__,
  __IMPORT_ROUTE_CONFIG_NAME__
} from './constant'

import type Context from './context'
import type { SFCBlock } from '@vue/compiler-sfc'
import { CustomBlock } from './types' 

const idMap = new Map()
const lastMap = new Map()
const map = new Map()
const PREFIX = 'virtual:vue-router_compiler_route'
const idReg = new RegExp(`^${PREFIX}(.*?)$`)
const resolvedIdReg = new RegExp(`^\0${PREFIX}(.*?)$`)

export default class Route {
  // static ensure(path = '') {
  //   let route = Route.get(path)
  //   if (!route) {
  //     route = new Route(path)
  //   }
  //   // map.set(route.resolvedId, route)
  //   return route
  // }

  static isRouteId(id = '') {
    return idReg.test(id)
  }

  static id(id = '') {
    // if (this.isRouteId(id)) return id
    return addQuery(__ROUTES_ENTRY_ID_VIRTUAL__, 'id', id)
  }

  static resolvedId(id = '') {
    // if (resolvedIdReg.test(id)) return id
    return resolvedVirtualId(Route.id(id))
  }

  static entryId = Route.id('entry')

  static resolvedEntryId = Route.resolvedId(Route.entryId)

  static resolveId(id = '') {
    if (id === this.entryId) return this.resolvedEntryId
    return idMap.get(id)
  }

  static routes() {
    const routes = []
    for (const route of map.values()) {
      routes.push(route)
    }
    return routes
  }

  static clear() {
    idMap.clear()
    lastMap.clear()
    map.forEach((v, k) => lastMap.set(k, v))
    map.clear()
  }

  static has(resolvedId = '') {
    if (!resolvedIdReg.test(resolvedId)) return false
    return map.has(resolvedId)
  }

  static get(resolvedId = '') {
    resolvedId = Route.resolvedId(resolvedId)
    return map.get(resolvedId)
  }

  ctx: Context

  path = ''

  route = ''

  id = ''

  block: SFCBlock | undefined

  constructor(ctx: Context, path = '', route = '') {
    this.ctx = ctx
    this.path = path
    this.route = route
    this.id = Route.id(this.path)
  }

  getImport(name = '') {
    return `import ${name} from ${stringify(this.id)}`
  }

  getComponentImport() {
    const mode = resolveImportMode(this.path, this.ctx.options.importMode)
    if (mode === 'sync') {
      return `import ${__IMPORT_COMPONENT_NAME__} from ${stringify(this.path)}\n`
    }
    return `const ${__IMPORT_COMPONENT_NAME__} = () => import(${stringify(this.path)})\n`
  }

  get pathRoute() {
    const name = 'pathRouteConfig'
    return {
      name,
      code: `
        const ${name} = {
          _f: 'auto',
          rawRoute: ${stringify(this.route)},
          component: ${__IMPORT_COMPONENT_NAME__}
        }
      `
    }
  }

  getRouteBlock() {
    const content = fs.readFileSync(this.path, 'utf8')
    const parsedSFC =  parse(content, {
      pad: 'space',
    }).descriptor
    return parsedSFC?.customBlocks.find(b => b.type === 'route')
  }

  getRouteImport() {
    const { name, code } = this.pathRoute
  
    if (!this.block) {
      return `
        ${this.getComponentImport()}
        ${code}
        const config = ${name}
      `
    }

    let id = addOriginal(this.path, `vue&index=0&type=route`)
    if (this.block.lang) {
      id = addQuery(id, `lang.${this.block.lang}`)
    }

    return `
      import * as ${__IMPORT_ROUTE_CONFIG_NAME__} from ${stringify(id)}
      ${this.getComponentImport()}
      const { default: def, ...rest } = ${__IMPORT_ROUTE_CONFIG_NAME__}
      ${code}

      const customBlock = Object.assign(def || {}, rest)
      const config = Object.assign(
        ${name}, 
        { customBlock }
      )

      console.log('config:', config)
    `
  }

  resolveRoute() {
    return `
        ${this.getRouteImport()}
        
        export default config
      `
  }

  checkBlock() {
    const debug = this.ctx.debug
    const oldBlock = this.block 
    const newBlock = this.getRouteBlock()

    if (!oldBlock && !newBlock) return

    if (!newBlock) {
      this.block = undefined
      debug.routeBlock('%s deleted', this.path)
      return
    }

    if (!oldBlock || !deepEqual(oldBlock, newBlock)) {
      debug.routeBlock('%s old: %O', this.path, oldBlock)
      debug.routeBlock('%s new: %O', this.path, newBlock)
      this.block = newBlock
      this.ctx.onUpdate()
    }

  }

  onAdded() {
    this.checkBlock()
  }

  onChanged() {
    this.checkBlock()
  }

  onRemoved() {
    this.block = undefined
  }
    

  // /**
  //  * html为空代表没有route标签
  //  */
  // get html() {
  //   return this.$route.toString()
  // }

  // /**
  //  * text为空代表route标签内没有代码
  //  */
  // get text() {
  //   return this.$route.text()
  // }

  // get attr() {
  //   return this.$route.attr()
  // }

  // /**
  //  * 如果text为空，可认为标签是自闭合标签
  //  * 在编译处理路由入口的时候会不同
  //  */
  // get selfClose() {
  //   return this.text.trim() === ''
  // }

  // private $route: Cheerio<Element> = load('')('div')

  // async read() {
  //   const buffer = await fs.readFile(this.path)
  //   const $ = load(buffer.toString())
  //   const _ = $('body > route')
  //   this.$route = _
  //   return _
  // }

  // record() {
  //   if (this.html) {
  //     map.set(this.resolvedId, this)
  //     idMap.set(this.id, this.resolvedId)
  //   }
  // }

  process() {
    // const [imports, exports] = parse(this.text)
    // if (!exports.includes('default')) {
    //   ctx.error(`路由文件 ${route.path} 自定义路由块中必须包含 export default`)
    // } else if (exports.length > 1) {
    //   ctx.warn({
    //     code: text,
    //     message: `路由文件 ${route.path} 自定义路由块中包含其他导出（默认导出除外），这些导出会被忽略请知晓`
    //   })
    // }
    // if (imports.length) {
    //   route.dependencies = imports.map(async t => {
    //     const dep = {
    //       id: t.n || '',
    //       resolvedId: '',
    //       info: t,
    //       start: t.s,
    //       end: t.e
    //     }
    //     if (!path.isAbsolute(dep.id)) {
    //       let resolvedId = await ctx.resolve(dep.id, route.path)
    //       resolvedId = resolvedId || {}
    //       if (!resolvedId.id) {
    //         ctx.warn({
    //           id: route.path,
    //           frame: text,
    //           hook: 'transform',
    //           code: text,
    //           message: `路由文件 ${route.path} 自定义路由块中111599999551，`,
    //         }, {
    //           line: 5,
    //           column: 25
    //         })
    //       }
    //     }
    //     return dep
    //   }) as any
    // }
  }
}

//   /**
//    * 存在 route 标签,
//    * 解析route便签的内容，处理依赖
//    */
//   if (routeString) {
//     const _id = `virtual:compiler_route(${file})`
//     const _rid = resolvedVirtualId(_id)
//     const route = {
//       id: _id,
//       resolvedId: _rid,
//       path: file,
//       import: `import '${_id}'`,
//       html: routeString,
//       innerText: '', // 标签内代码
//       dependencies: [], // 依赖项
//       code: ''
//     }
//     idMap.set(route.id, route.resolvedId)
//     codeMap.set(route.resolvedId, route)

//     const parser = new Parser({
//       onopentag() {},
//       onattribute(attr, value) {
//         console.log(attr, value)
//       },
//       ontext(text) {
//         if (text) {
//           route.innerText = text

//         }
//         // console.log(text, route.dependencies)
//       }
//     })
//     route.dependencies = await Promise.all(route.dependencies)
//     routes.push(route)
//   }
// }

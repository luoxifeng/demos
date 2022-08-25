import { ViteDevServer } from 'vite'
import { resolve, join, extname } from 'path'
import { slash, toArray } from '@antfu/utils'
import { resolveOptions } from './options'
import { getPageFiles } from './files'
import { debug } from './debug'
import Route from './route'
import { __IMPORT_ROUTE_NAME__, __RUNTIME_ID_VIRTUAL__, __CASE_SENSITIVE__, __ROUTE_STYLE__ } from './constant'
import { countSlash, stringify, invalidatePagesModule } from './utils'
import { createRuntime } from './runtime'

import type { UserOptions, ResolvedOptions, ViteCommand, PageOptions } from './types'

export default class Context {
  private _server: ViteDevServer | undefined
  private _pageRouteMap = new Map<string, Route>()

  rawOprions: UserOptions
  options: ResolvedOptions
  root: string
  command: ViteCommand

  constructor(userOptions: UserOptions, viteRoot: string = process.cwd(), viteCommand: ViteCommand) {
    this.rawOprions = userOptions

    this.root = slash(viteRoot)
    debug.env('root', this.root)
    this.command = viteCommand
    debug.env('command', this.command)

    this.options = resolveOptions(userOptions, this.root)
    debug.options('root', this.options)
  }

  get isDev() {
    return this.command === 'serve'
  }

  isTarget(path: string) {
    const { dirs, root, extensionsRE } = this.options
    
    if (extensionsRE.test(path)) {
      for (const page of dirs) {
        const dirPath = slash(resolve(root, page.dir))
        if (path.startsWith(dirPath)) return true
      }

    }
    return false
  }

  setupViteServer(server: ViteDevServer) {
    if (this._server === server) return

    this._server = server
    this.setupWatcher(server.watcher)
  }

  setupWatcher(watcher: ViteDevServer['watcher']) {
    function isTarget() { return false }
    watcher
    .on('unlink', async(path) => {
      path = slash(path)
      if (!isTarget(path, this.options))
        return
      await this.removePage(path)
      this.onUpdate()
    })
  watcher
    .on('add', async(path) => {
      path = slash(path)
      if (!isTarget(path, this.options))
        return
      const page = this.options.dirs.find(i => path.startsWith(slash(resolve(this.root, i.dir))))!
      await this.addPage(path, page)
      this.onUpdate()
    })

  watcher
    .on('change', async(path) => {
      path = slash(path)
      if (!isTarget(path, this.options))
        return
      const page = this._pageRouteMap.get(path)
      if (page)
        await this.options.resolver.hmr?.changed?.(this, path)
    })
  }

  async addPage(path: string | string[], pageDir: PageOptions) {
    debug.pages('add', path)
    for (const p of toArray(path)) {
      const pageDirPath = slash(resolve(this.root, pageDir.dir))
      const routePath = slash(join(pageDir.baseRoute, p.replace(`${pageDirPath}/`, '').replace(extname(p), '')))
      const route = new Route(this, p, routePath)
      this._pageRouteMap.set(route.path, route)
      route.onAdded()
    }
  }

  async removePage(path: string) {
    debug.pages('remove', path)
    const route = this._pageRouteMap.get(path)
    this._pageRouteMap.delete(path)
    route?.onRemoved()
  }



  onUpdate() {
    if (!this._server) return

    invalidatePagesModule(this._server)
    debug.hmr('Reload generated routes.')
    this._server.ws.send({
      type: 'full-reload',
    })
  }


  async searchGlob() {
    const pageDirFiles = this.options.dirs.map((page) => {
      const pagesDirPath = slash(resolve(this.options.root, page.dir))
      const files = getPageFiles(pagesDirPath, this.options)
      debug.search(page.dir, files)
      return {
        ...page,
        files: files.map((file) => slash(file))
      }
    })

    for (const page of pageDirFiles) await this.addPage(page.files, page)
  }

 

  async resolveRoutes(id: string | null) {
    if (id) {
      // 单个路由处理
      const route = this._pageRouteMap.get(id)
      return route?.resolveRoute()
    }

    // 所有单个路由入口
    return this.resolveAllRoutes()
  }

  resolveAllRoutes() {
    const imports: string[] = []
    const names: string[] = []

    this.routes.forEach((route, index) => {
      const name = __IMPORT_ROUTE_NAME__.replace('$', `${index}`)
      imports.push(route.getImport(name))
      names.push(name)
    })

    imports.push(`import runtime from ${stringify(__RUNTIME_ID_VIRTUAL__)}`)

    return `
      ${imports.join('\n')}

      const unComputedRoutes = [
        ${names.join(',\n  ')}
      ]

      console.log('unComputedRoutes:', unComputedRoutes)
      const computedRoutes = runtime.computeRoutes(unComputedRoutes)
      console.log('computedRoutes:', computedRoutes)

      export default computedRoutes
    `
  }

  get debug() {
    return debug
  }

  get pageRouteMap() {
    return this._pageRouteMap
  }

  get routes() {
    return [...this._pageRouteMap.values()].sort((a, b) => countSlash(a.route) - countSlash(b.route))
  }

  generateRuntime() {
    const code = createRuntime
      .toString()
      .replace(__CASE_SENSITIVE__, `${this.options.caseSensitive}`)
      .replace(__ROUTE_STYLE__, `${this.options.routeStyle === 'nuxt'}`)

    return `
      \n${code}
      \nconst runtime = ${createRuntime.name}()
      \nexport default runtime 
    `
  }
}

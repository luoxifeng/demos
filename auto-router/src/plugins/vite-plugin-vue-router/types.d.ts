export type Auto = 'full' | 'half' | 'none'

export type ViteCommand = 'serve' | 'build'

export type ImportMode = 'sync' | 'async'

export type ImportModeFun = (path: string) => ImportMode

export type ImportModeResolver = ImportMode | ImportModeFun

export interface PageOptions {
  dir: string
  baseRoute: string
}

interface BaseOptions {
  auto: Auto

  /**
   * Paths to the directory to search for page components.
   * @default 'src/pages'
   */
  dirs: string | (string | PageOptions)[]

  extensions: string[]

  exclude: string[]

  /**
   * Case for route paths
   * @default false
   */
  caseSensitive: boolean

  /**
   * Routing style
   * @default false
   */
  routeStyle: 'next' | 'nuxt'

  importMode: ImportModeResolver
}

export type UserOptions = Partial<BaseOptions>

export type ResolvedOptions = {
  root: string

  /**
   * Resolved page dirs
   */
  dirs: PageOptions[]

  /**
   * RegExp to match extensions
   */
  extensionsRE: RegExp
} & BaseOptions

export type CustomBlock = Record<string, any>

export interface VueRouteBase {
  name: string
  path: string
  props?: boolean
  // component: string
  children?: VueRouteBase[]
  customBlock?: CustomBlock
  rawRoute: string
}

export type Optional<T, K extends keyof T> = Pick<Partial<T>, K> & Omit<T, K>

export interface VueRoute extends Omit<Optional<VueRouteBase, 'rawRoute' | 'name'>, 'children'> {
  children?: VueRoute[]
}

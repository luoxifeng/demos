import { resolve, normalize } from 'path'
import { slash, toArray } from '@antfu/utils'
import { getPageDirs } from './files'
import { debug } from './debug'
import { UserOptions, ResolvedOptions } from './types'

function resolvePageDirs(dirs: UserOptions['dirs'], root: string, exclude: string[]) {
  dirs = toArray(dirs)
  return dirs.flatMap((dir) => {
    const option = typeof dir === 'string' ? { dir, baseRoute: '' } : dir

    option.dir = slash(resolve(root, option.dir)).replace(`${root}/`, '')
    option.baseRoute = option.baseRoute.replace(/^\//, '').replace(/\/$/, '')

    const pages = getPageDirs(option, root, exclude)
    debug.pages('dirs', pages)

    return pages
  })
}

export function resolveOptions(userOptions: UserOptions, viteRoot?: string) {
  const { dirs = ['src/pages'], auto = 'none', exclude = [], caseSensitive = false } = userOptions

  const root = viteRoot || slash(process.cwd())

  const importMode = userOptions.importMode || 'async'

  const extensions = userOptions.extensions || ['vue', 'ts', 'js', 'tsx', 'jsx']

  const extensionsRE = new RegExp(`\\.(${extensions.join('|')})$`)

  const resolvedDirs = resolvePageDirs(dirs, root, exclude)

  const routeStyle = userOptions.routeStyle || 'nuxt'

  const resolvedOptions: ResolvedOptions = {
    dirs: resolvedDirs,
    auto,
    routeStyle,
    root,
    extensions,
    exclude,
    caseSensitive,
    // syncIndex,
    // nuxtStyle,
    importMode,
    extensionsRE
    // routeBlockLang,
    // replaceSquareBrackets,
    // extendRoute,
    // onRoutesGenerated,
    // onClientGenerated,
  }

  return resolvedOptions
}

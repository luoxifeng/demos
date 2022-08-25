
import path from 'path'
import { __original__, countSlashRE, __ROUTES_ENTRY_ID_VIRTUAL__ } from './constant'

import type { ModuleNode, ViteDevServer } from 'vite'
import type { ImportModeResolver } from './types'

export { resolvedVirtualId } from './constant'

export function countSlash(value: string) {
  return (value.match(countSlashRE) || []).length
}

export function getExcludes(exclude: string | string[]) {
  return [exclude]
    .flat()
    .filter(Boolean)
    .map((t) => `!${path.join(process.cwd(), t)}`)
}

export function resolveImportMode(
  filepath: string,
  importModeResolver: ImportModeResolver
) {
  if (typeof importModeResolver === 'function')
    return importModeResolver(filepath)
  return importModeResolver
}

export function addQuery(target = '', key = '', value = '') {
  const append = value ? [key, value].join('=') : key
  return target.includes('?') ? `${target}&${append}` : `${target}?${append}`
}

export function parseQuery(id: string) {
  const [moduleId, rawQuery] = id.split('?', 2)
  const query = new URLSearchParams(rawQuery)
  const queryId = query.get('id')
  return {
    moduleId,
    query,
    queryId,
  }
}


export const addOriginal = (target = '', key = '', value = '') => {
  return addQuery(addQuery(target, key, value), __original__)
}

/**
 * id是否包含__original__标记
 */
export const hasOriginal = (target = '') => target.includes(__original__)

export const notOriginal = (target = '') => !hasOriginal(target)

export const isRoute = (target = '') => !hasOriginal(target)

export const stringify = JSON.stringify

export function extsToGlob(extensions: string[]) {
  return extensions.length > 1 ? `{${extensions.join(',')}}` : extensions[0] || ''
}

export function invalidatePagesModule(server: ViteDevServer) {
  const { moduleGraph } = server
  const mods = moduleGraph.getModulesByFile(__ROUTES_ENTRY_ID_VIRTUAL__)
  if (mods) {
    const seen = new Set<ModuleNode>()
    mods.forEach((mod) => {
      moduleGraph.invalidateModule(mod, seen)
    })
  }
}
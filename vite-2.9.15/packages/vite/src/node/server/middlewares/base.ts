import { parse as parseUrl } from 'url'
import type { Connect } from 'types/connect'
import type { ViteDevServer } from '..'

// this middleware is only active when (config.base !== '/')

export function baseMiddleware({
  config
}: ViteDevServer): Connect.NextHandleFunction {
  const base = config.base

  // Keep the named function. The name is visible in debug logs via `DEBUG=connect:dispatcher ...`
  return function viteBaseMiddleware(req, res, next) {
    const url = req.url!
    const parsed = parseUrl(url)
    const path = parsed.pathname || '/'

    if (path.startsWith(base)) {
      // rewrite url to remove base.. this ensures that other middleware does
      // not need to consider base being prepended or not
      req.url = url.replace(base, '/')
      return next()
    }

    // skip redirect and error fallback on middleware mode, #4057
    if (config.server.middlewareMode) {
      return next()
    }

    if (path === '/' || path === '/index.html') {
      // redirect root visit to based url with search and hash
      res.writeHead(302, {
        Location: base + (parsed.search || '') + (parsed.hash || '')
      })
      res.end()
      return
    } else if (req.headers.accept?.includes('text/html')) {
      // non-based page visit
      const redirectPath = base + url.slice(1)
      res.writeHead(404, {
        'Content-Type': 'text/html'
      })
      res.end(
        `The server is configured with a public base URL of ${base} - ` +
          `did you mean to visit <a href="${redirectPath}">${redirectPath}</a> instead?`
      )
      return
    }

    next()
  }
}

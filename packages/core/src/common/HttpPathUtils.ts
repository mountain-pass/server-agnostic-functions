import { KeyValueArrayMap } from '../types/HttpTypes'

/**
 * Converts a string to a regex named group (capturing) matcher.
 * @param pathMatcher e.g. '/foo/{bar}/test'
 * @returns e.g. '/foo/(?<bar>[^/]+)/test'
 */
export const convertToRegexMatcher = (pathMatcher: string | RegExp) => {
  if (pathMatcher instanceof RegExp) {
    return pathMatcher
  } else if (typeof pathMatcher === 'string') {
    let regexStr = pathMatcher.replace(/\{(\w+)\}/g, (match, group) => {
      return match ? `(?<${group}>[^/?]+)` : ''
    })
    if (regexStr.endsWith('/*')) {
      // support '/*' match all wildcards
      regexStr = `^${regexStr}.*(\\?|$)`
    } else if (regexStr.endsWith('/')) {
      // support optional trailing slash
      regexStr = `^${regexStr}?(\\?|$)`
    } else {
      regexStr = `^${regexStr}/?(\\?|$)` // add optional trailing slash
    }
    return new RegExp(regexStr)
  } else {
    throw new Error(`Path matcher must be a string or RegExp, got ${typeof pathMatcher}.`)
  }
}

/**
 * Parses the path params from the actual path and the path matcher.
 * @param actualPath e.g. '/path/cat/path/dog'
 * @param pathMatcher e.g. '/path/{bar}/path/{foo}'
 * @returns e.g. { bar: 'cat', foo: 'dog' }
 */
export const parsePathParams = (actualPath: string, regexPathMatcher: RegExp) => {
  const match = regexPathMatcher.exec(actualPath)
  if (match === null) {
    throw new Error(`Path '${actualPath}' does not match path matcher '${regexPathMatcher.toString()}'.`)
  }
  // can still be undefined... so return an empty object
  return match.groups || {}
}

/**
 * Converts URLSearchParams to a KeyValueArrayMap.
 * @param entries
 * @returns
 */
export const urlSearchParamsToKeyValueArrayMap = (entries: URLSearchParams) => {
  const result: KeyValueArrayMap = {}
  for (const [key, value] of entries) {
    if (Array.isArray(result[key])) {
      result[key].push(value)
    } else {
      result[key] = [value]
    }
  }
  return result
}

// import fs from 'fs/promises'
// import path from 'path'
// import { HttpRequest } from '../types/HttpRequest'
// import { HttpResponse } from '../types/HttpResponse'
// import { RouteHandler } from './AgnosticRouter'

// async function exists(file: string) {
//   try {
//     await fs.stat(file)
//     return true
//   } catch {
//     return false
//   }
// }

// export const serveStatic = (
//   basepath = '.',
//   listdir = true,
//   defaultFileEncoding: BufferEncoding = 'utf-8',
//   cacheTimeSecs: number = 60
// ): RouteHandler<any, any> => {
//   const abspath = path.resolve(basepath)
//   console.log(`serving static files from ${abspath}...`)

//   return async (req: HttpRequest, res: HttpResponse) => {
//     // apply caching - these artifacts are static after all...
//     if (cacheTimeSecs > 0) {
//       res.headers['cache-control'] = [
//         `public, max-age=${cacheTimeSecs}, s-maxage=${cacheTimeSecs}, stale-while-revalidate=${cacheTimeSecs}, stale-if-error=${cacheTimeSecs}`
//       ]
//     } else if (cacheTimeSecs === 0) {
//       res.headers['cache-control'] = [
//         `public, max-age=604800, s-maxage=604800, stale-while-revalidate=604800, stale-if-error=604800, immutable`
//       ]
//     } else if (cacheTimeSecs === -1) {
//       res.headers['cache-control'] = ['no-cache, no-store, must-revalidate']
//     }
//     const reqpath = req.params.path
//     const file = reqpath ? path.resolve(path.join(abspath, reqpath)) : abspath
//     const relpath = path.relative(abspath, file)
//     if (relpath.startsWith('..')) {
//       res.status(401)
//       res.send('Forbidden')
//       return
//     }
//     if (await exists(file)) {
//       const isdir = (await fs.stat(file)).isDirectory()
//       if (listdir && isdir) {
//         res.json(await fs.readdir(file))
//         return
//       }
//       if (!isdir) {
//         res.send(await fs.readFile(file, { encoding: defaultFileEncoding }))
//         return
//       }
//     }
//     res.status(404)
//     res.send('Not found')
//   }
// }

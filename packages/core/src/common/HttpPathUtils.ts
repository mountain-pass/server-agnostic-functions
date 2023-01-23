import { KeyValueArrayMap } from '../types/HttpTypes'

/**
 * Converts a string to a regex named group (capturing) matcher.
 * @param pathMatcher e.g. '/foo/{bar}/test'
 * @returns e.g. '/foo/(?<bar>[^/]+)/test'
 */
export const convertToRegexMatcher = (pathMatcher: string) => {
  return new RegExp(
    '^' +
      pathMatcher.replace(/\{(\w+)\}/g, (match, group) => {
        return match ? `(?<${group}>[^/?]+)` : ''
      }) +
      '(\\?|$)'
  )
}

/**
 * Parses the path params from the actual path and the path matcher.
 * @param actualPath e.g. '/path/cat/path/dog'
 * @param pathMatcher e.g. '/path/{bar}/path/{foo}'
 * @returns e.g. { bar: 'cat', foo: 'dog' }
 */
export const parsePathParams = (actualPath: string, regexPathMatcher: RegExp) => {
  const match = regexPathMatcher.exec(actualPath)
  if (match === null)
    throw new Error(`Path '${actualPath}' does not match path matcher '${regexPathMatcher.toString()}'.`)
  return match.groups
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
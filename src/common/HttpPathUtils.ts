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

export type QueryablePromise<Type> = Promise<Type> & {
  isFulfilled: () => boolean
  isPending: () => boolean
  isRejected: () => boolean
}

/**
 * This function allow you to modify a JS Promise by adding some status properties.
 * Based on: http://stackoverflow.com/questions/21485545/is-there-a-way-to-tell-if-an-es6-promise-is-fulfilled-rejected-resolved
 * But modified according to the specs of promises : https://promisesaplus.com/
 */
export function makeQuerablePromise<Type>(promise: Promise<Type> | Type): QueryablePromise<Type> {
  // Don't modify any promise that has been already modified.
  if ((promise as any).isFulfilled) return promise as QueryablePromise<Type>

  // Set initial state
  let isPending = true
  let isRejected = false
  let isFulfilled = false

  // Observe the promise, saving the fulfillment in a closure scope.
  const result = Promise.resolve(promise).then(
    function (v) {
      isFulfilled = true
      isPending = false
      return v
    },
    function (e) {
      isRejected = true
      isPending = false
      throw e
    }
  ) as any as QueryablePromise<Type>

  result.isFulfilled = function () {
    return isFulfilled
  }
  result.isPending = function () {
    return isPending
  }
  result.isRejected = function () {
    return isRejected
  }
  return result
}

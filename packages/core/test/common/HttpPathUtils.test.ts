import { expect } from 'chai'
import { describe, it } from 'mocha'
import { convertToRegexMatcher, parsePathParams } from '../../src/common/HttpPathUtils'

type StringAny = [string, any]

describe('HttpPathUtils', () => {
  describe('the path "/users/{userId}" should pass path params', () => {
    const regex = convertToRegexMatcher('/users/{userId}')

    const shouldMatch: StringAny[] = [
      ['/users/123', { userId: '123' }],
      ['/users/abc', { userId: 'abc' }],
      ['/users/abc?foo=bar', { userId: 'abc' }],
      // test trailing slashes and query params
      ['/users/123/', { userId: '123' }],
      ['/users/abc/', { userId: 'abc' }],
      ['/users/abc/?foo=bar', { userId: 'abc' }]
    ]
    const shouldNotMatch = ['/', '/users', '/users/', '/users/123/abc', '/users/123/abc/']

    shouldMatch.forEach(([path, expected]) => {
      it(`should match "${path}"`, () => {
        expect(regex.test(path)).to.equal(true)
        expect(parsePathParams(path, regex)).to.deep.equal(expected)
      })
    })
    shouldNotMatch.forEach((path) => {
      it(`should not match "${path}"`, () => {
        expect(regex.test(path)).to.not.equal(true)
      })
    })
  })

  describe('given the path "/users/{userId}/foo/{bar}"', () => {
    const regex = convertToRegexMatcher('/users/{userId}/foo/{bar}')

    const shouldMatch: StringAny[] = [
      ['/users/abc/foo/dog', { userId: 'abc', bar: 'dog' }],
      // test trailing slashes and query params
      ['/users/abc/foo/dog/', { userId: 'abc', bar: 'dog' }],
      ['/users/abc/foo/dog?name=bob', { userId: 'abc', bar: 'dog' }],
      ['/users/abc/foo/dog/?name=bob', { userId: 'abc', bar: 'dog' }]
    ]
    const shouldNotMatch = ['/users/123/abc', '/users/123/abc/', '/users/abc/foo/dog/def']

    shouldMatch.forEach(([path, expected]) => {
      it(`should match "${path}"`, () => {
        expect(regex.test(path), regex.toString()).to.equal(true)
        expect(parsePathParams(path, regex)).to.deep.equal(expected)
      })
    })
    shouldNotMatch.forEach((path) => {
      it(`should not match "${path}"`, () => {
        expect(regex.test(path)).to.not.equal(true)
      })
    })
  })

  describe('should support wildcards "/*" and optional trailing slashes', () => {
    const regex = convertToRegexMatcher('/users/*')

    const shouldMatch: StringAny[] = [
      // no query params
      ['/users', {}],
      ['/users/', {}],
      ['/users/abc', {}],
      ['/users/abc/foo/dog', {}],
      // with query params
      ['/users?name=bob', {}],
      ['/users/?name=bob', {}],
      ['/users/abc?name=bob', {}],
      ['/users/abc/foo/dog?name=bob', {}]
    ]
    const shouldNotMatch = ['/invalidpath']

    shouldMatch.forEach(([path, expected]) => {
      it(`should match "${path}"`, () => {
        expect(regex.test(path), regex.toString()).to.equal(true)
        expect(parsePathParams(path, regex)).to.deep.equal(expected)
      })
    })
    shouldNotMatch.forEach((path) => {
      it(`should not match "${path}"`, () => {
        expect(regex.test(path)).to.not.equal(true)
      })
    })
  })

  describe('should support wildcards "/*" and optional trailing slashes', () => {
    const regex = convertToRegexMatcher('/users/*')

    const shouldMatch: StringAny[] = [
      // no query params
      ['/users', {}],
      ['/users/', {}],
      ['/users/abc', {}],
      ['/users/abc/foo/dog', {}],
      // with query params
      ['/users?name=bob', {}],
      ['/users/?name=bob', {}],
      ['/users/abc?name=bob', {}],
      ['/users/abc/foo/dog?name=bob', {}]
    ]
    const shouldNotMatch = ['/invalidpath']

    shouldMatch.forEach(([path, expected]) => {
      it(`should match "${path}"`, () => {
        expect(regex.test(path), regex.toString()).to.equal(true)
        expect(parsePathParams(path, regex)).to.deep.equal(expected)
      })
    })
    shouldNotMatch.forEach((path) => {
      it(`should not match "${path}"`, () => {
        expect(regex.test(path)).to.not.equal(true)
      })
    })
  })
})

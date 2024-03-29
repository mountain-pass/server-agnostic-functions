# @mountainpass/server-agnostic-functions-core <!-- omit in toc -->

Provides an interface for writing server-agnostic (serverless) functions.

# Table of contents <!-- omit in toc -->
- [Problem outline](#problem-outline)
  - [Solution:](#solution)
- [Example Usage](#example-usage)
- [Supported Providers](#supported-providers)
- [Http Methods](#http-methods)
- [Multiple Routers](#multiple-routers)
- [Paths and Path Parameters](#paths-and-path-parameters)
- [Middleware](#middleware)
- [Utilities](#utilities)
  - [InMemoryCache](#inmemorycache)
  - [Static File Serving](#static-file-serving)
- [Caveats](#caveats)
  - [Building your own Provider wrapper](#building-your-own-provider-wrapper)
- [Notes](#notes)


# Problem outline

The name "serverless functions" is a misnomer - there's always a server involved. The intention of the term is to demonstrate that the developer is shielded from the operational concerns - however there are still many facets that make serverless implementations difficult to maintain:

**Vendor Lock In**

- providers impose their own method signatures and functional behaviours

**Libraries**

- providers don't always provide NodeJS execution environments

**Routing**

- providers do not support hosting multiple functions (there are workarounds, such as using bespoke Router implementations, or requiring external configuration files)

**Testing**

- providers require you to install their command line utilities so you can test and develop locally

---

Every service provider has reinvented it's own serverless function interfaces which means vendor lockin - we strive to be provider agnostic.

## Solution:

This library provides an `AgnosticRouter` class (and `HttpRequest`, `HttpResponse` interfaces), so that functions can be built using a standard (HTTP) interface, and then wrapped in it's respective runtime `Wrapper`.

Due to the simplified interface and the inbuilt Routing layer, we can reliably unit test our Router in isolation, with the confidence that the hosted service will behave consistently at runtime.

# Example Usage

Here is an example `AgnosticRouter` implementation. e.g.

```javascript
import { AgnosticRouter } from '@mountainpass/server-agnostic-functions-core'

const router = new AgnosticRouter()

router.get('/users/{userId}', (req, res) => {
    res.json({message: 'success', user: req.params.userId })
})
router.get('/services/getUsersByQueryId', (req, res) => {
    res.json({message: 'success', user: req.query.userId })
})
```

Then to host it, wrap it in your service provider's wrapper. Below is an example using `ExpressWrapper`. e.g.

```javascript
import { ExpressWrapper } from '@mountainpass/server-agnostic-functions-express'
import express from 'express'

const app = express()
app.use(new ExpressWrapper().wrap(diagnosticRouter()))
app.listen(3000, () => console.log('listening on port 3000'))

```

More provider examples are available below.

# Supported Providers

Supported provider wrappers and their example usages:

| Status | Package | Provides a wrapper for... | Usage Example |
| --- |--- | --- | --- |
| ✅ | @mountainpass/server-agnostic-functions-aws | AWS Lambda Functions  | [Link](/examples/aws/index.ts) |
| ✅ | @mountainpass/server-agnostic-functions-cloudflare | Cloudflare Workers | [Link](/examples/cloudflare/src/index.ts) |
| ✅ | @mountainpass/server-agnostic-functions-express | Express NodeJs Web Application Framework | [Link](/examples/express/index.ts) |
| ❓ | [*Your Provider?*](#building-your-own-provider-wrapper) | | |

# Http Methods

The router provides helper functions for all http methods. e.g.

```javascript
router.get('/mypath', ...)
router.post('/mypath', ...)
router.put('/mypath', ...)
router.delete('/mypath', ...)
router.patch('/mypath', ...)
router.head('/mypath', ...)
router.options('/mypath', ...)
router.connect('/mypath', ...)
router.trace('/mypath', ...)
```

# Multiple Routers

Have multiple routers? The core library allows you to join two routers together.

Use the following code to add **router2's** `middleware` and `routes`, into the original **router**. These calls can be chained.

```javascript
router
    .join(router2)
    .join(router3)
```

# Paths and Path Parameters

The following example demonstrates the use of paths and path parameters. e.g.

```javascript
// simple paths
router.get('/', ...)
router.get('/some/path', ...)

// path parameters
router.get('/user/{userId}/order/{orderId}', (req, res) => {
    res.json({ user: req.params.userId, order: req.params.orderId })
})

// regular expressions and named groups
router.get(/^\/some\/path$/, ...)
router.get('/some/path/.*', ...)
router.get('/user/(?<userId>[^/?]+)/order/(?<orderId>[^/?]+)', (req, res) => {
    res.json({ user: req.params.userId, order: req.params.orderId })
})
```

# Middleware

There is a `use` function for providing middleware on incoming requests. You may end the response flow at any point, by invoking the `res.json()`, `res.send()`, or `res.end()` functions. e.g.

```javascript
// apply a global response header
router.use(async (req: HttpRequest, res: HttpResponse) => {
    res.headers['access-control-allow-origin'] = ['*']
})

// reject unauthorised requests
router.use(async (req: HttpRequest, res: HttpResponse) => {
    if (!isAuthorised(req)) {
        res.status(401)
        res.send('Unauthorised')
    }
})
```

# Utilities 

## InMemoryCache

An inmemory, temporal, lazy loading cache (`InMemoryCacher`) is provided, for caching data.

Alternatively you can use the `HttpResponseCacher`, a higher level abstraction which handles the http response for you (and supports `ETag` and `Cache-Control` headers).

```javascript
import {
    AgnosticRouter,
    FetchResponseQueryablePromise,
    hashString,
    HttpRequest,
    HttpResponse,
    HttpResponseCacher
} from '@mountainpass/server-agnostic-functions-core';
import mongoose from 'mongoose';
import Users from './db/Users.model';

// responsible for fetching data from the database and caching it, based on a key
const dataFetcher = new HttpResponseCacher(async (key: string, prevData: FetchResponseQueryablePromise<string> | undefined) => {
    await mongoose.connect(process.env.MONGO_URL)
    const tmp = await Users.find({ userId: key })
    const data = JSON.stringify(tmp)
    const hash = hashString(data)
    // returns two objects the data and the hash
    return { data, hash }
}, { maxAgeMs: 30000, maxItems: 10 })

export const router = new AgnosticRouter()

// fetches data from the cache based on the userId key
router.get('/users/{userId}', async (req: HttpRequest, res: HttpResponse) => {
    return dataFetcher.fetchAndServe(req, res, req.params.userId)
}
```

## Static File Serving

We don't currently support serving files from the filesystem for two reasons:
1. some providers don't give access to a file system
2. some providers don't support NodeJS environments

However, I can definitely see the value in being able to provide this functionality.

I'd love to hear if anyone has any ideas on how to solve this. e.g.
- package a zip file's binary contents into a `.js` file, and then unzip and serve content from in memory. (https://www.npmjs.com/package/jszip)
- provide a separate NPM package, so serverless environments that do support `fs` operations can opt in.

<!-- To serve the contents of a static directory, you can use the `serveStatic` helper function. Use the reserved keyword `path`, as the regex named group, to support serving child files/folders. e.g.

```javascript
import { serveStatic } from '@mountainpass/server-agnostic-functions-core'

router.get('/static/?(?<path>.*)', serveStatic(path.join(__dirname)))
``` -->

# Caveats

Most serverless functions do not support maintaining websockets or streaming content. As such, we have not included support for these services.

Some serverless environments are not NodeJS environments. As such, efforts have been made to exclude all NodeJS native libraries and global variables usage from the `core` module.

## Building your own Provider wrapper

Don't see your provider? Have a go at writing your own, it's actually very easy! Start with the [AwsWrapper](https://github.com/mountain-pass/server-agnostic-functions/tree/main/packages/aws/src/providers/AwsWrapper.ts) as an example.

Once it's ready, please submit a PR back to the repo, so the entire community can benefit!

The wrapper should be as lightweight and efficient as possible. Avoid adding unneccessary libraries or code.

# Notes

- The `AgnosticRouter` can take Type arguments, for the underlying `Request` and `Response` types. These are then provided via the `underlying` property, on the `HttpRequest` and `HttpResponse` handler parameters.
- The `AgnosticRouter` does not (currently) support nesting child `AgnosticRouter`s.
- Future updates: Programatically creating the Routes, lends itself to automatic API documentation.


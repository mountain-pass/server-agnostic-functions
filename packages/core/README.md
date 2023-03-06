# @mountainpass/server-agnostic-functions-core

Provides an interface for writing server-agnostic (serverless) functions.

# Problem outline

The name "serverless functions" is a misnomer - there's always a server involved. The intention of the term is to demonstrate that the developer is shielded from the operational concerns - however there are still many facets that make serverless implementations difficult to maintain:

**Vendor Lock In**

- providers impose their own method signatures and functional behaviours

**Routing**

- providers do not support hosting multiple functions (there are workarounds, such as using bespoke Router implementations, or requiring external configuration files)

**Testing**

- providers require you to install their command line utilities so you can test and develop locally

---

Every service provider has reinvented it's own serverless function interfaces which means vendor lockin - we strive to be provider agnostic.

## Solution:

This library provides an `AgnosticRouter` class (and `HttpRequest`, `HttpResponse` interfaces), so that functions can be built using a standard (HTTP) interface, and then wrapped in it's respective runtime `Wrapper`.

Due to the simplified interface and the inbuilt Routing layer, we can now reliably unit test our Router in isolation (free from servers), with the confidence that the hosted service will behave consistently at runtime.

Check out the [AgnosticRouter.test.ts](https://github.com/mountain-pass/server-agnostic-functions/blob/main/packages/core/test/common/AgnosticRouter.test.ts) unit test for usage examples.

# Example Usage

Here is an example of an `AgnosticRouter` implementation. e.g.

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

Then to host it, wrap it in your service provider's wrapper.

Below is an example using the `ExpressWrapper.wrap()`. e.g.

```javascript
import ExpressWrapper from '@mountainpass/server-agnostic-functions-express'

const app = express()
app.use(ExpressWrapper.wrap(express.Router(), router))
app.listen(4000)
```

More provider examples are available below.

# Methods and Utilities

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

# Paths and Path Parameters

The following example demonstrates the use of paths and path parameters. e.g.

```javascript
// simple paths
router.get('/', ...)
router.get('/some/path', ...)

// path parameters
router.get('/user/{userId}/order/{orderId}', (req, res) => res.json({ user: req.params.userId, order: req.params.orderId }))

// regular expressions and named groups
router.get(/^\/some\/path$/, ...)
router.get('/some/path/.*', ...)
router.get('/user/(?<userId>[^/?]+)/order/(?<orderId>[^/?]+)', (req, res) => res.json({ user: req.params.userId, order: req.params.orderId }))
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

To serve the contents of a static directory, you can use the `serveStatic` helper function. Use the reserved keyword `path`, as the regex named group, to support serving child files/folders. e.g.

```javascript
import { serveStatic } from '@mountainpass/server-agnostic-functions-core'

router.get('/static/?(?<path>.*)', serveStatic(path.join(__dirname)))
```

# Caveats

Most serverless functions do not support maintaining websockets or streaming content. As such, we have not included support for these services.

# Provider wrappers & Building your own

Supported provider wrappers and their example usages:

- ✅ [`AwsWrapper`](https://github.com/mountain-pass/server-agnostic-functions/tree/main/examples/aws/src/index.mjs)
- ✅ [`CloudflareWrapper`](https://github.com/mountain-pass/server-agnostic-functions/tree/main/examples/cloudflare/src/index.ts)
- ✅ [`ExpressWrapper`](https://github.com/mountain-pass/server-agnostic-functions/tree/main/examples/express/index.ts)
- ❓ GCP
- ❓ *Your Provider?*

## Building your own Provider wrapper

Don't see your provider? Have a go at writing your own, it's actually very easy! Start with the [AwsWrapper](https://github.com/mountain-pass/server-agnostic-functions/tree/main/packages/aws/src/providers/AwsWrapper.ts) as an example.

Once it's ready, please submit a PR back to the repo, so the entire community can benefit!

The wrapper should be as lightweight and efficient as possible. Avoid adding unneccessary libraries or code.

# Notes

- The `AgnosticRouter` can take Type arguments, for the underlying `Request` and `Response` types. These are then provided via the `underlying` property, on the `HttpRequest` and `HttpResponse` handler parameters.
- The `AgnosticRouter` does not (currently) support nesting child `AgnosticRouter`s.
- Future updates: Programatically creating the Routes, lends itself to automatic API documentation.


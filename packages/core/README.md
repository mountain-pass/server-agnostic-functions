# @mountainpass/server-agnostic-functions

Provides an interface for writing server-agnostic (serverless) functions.

# Introduction

The name "serverless functions" is a misnomer - there's always a server involved. The name intends to demonstrate that the developer is shielded from the operational concerns of having to host & maintain a server.

Being agnostic of the server implementation is the ultimate goal!

However...

**Vendor Lock In**

Every service provider still imposes their own method signatures and functional behaviours on the developer. Not very agnostic!

**Routing**

Some providers do **not** support hosting multiple functions. Some require you to use their bespoke Router implementation. While others ask you to create YAML configurations. Yuck!

**Testing**

Some providers require you to install their command line utilities, so you can test and develop locally. Bleagh!

# Problem Outline

## Problem: 

Every service provider has reinvented it's own serverless function interfaces - which is the opposite of being "provider agnostic". (Bad for reasons above.)

## Our Solution:

This library provides an `AgnosticRouter` class (and `HttpRequest`, `HttpResponse` interfaces), so that functions can be built using a standard (HTTP) interface, and then wrapped in it's respective runtime `Wrapper`.

# Example Usage

Here is an example of an `AgnosticRouter` implementation.

```javascript
const router = new AgnosticRouter()

router.get('/users/{userId}', (req, res) => {
    res.json({message: 'success', user: req.params.userId })
})
router.get('/services/getUsersByQueryId', (req, res) => {
    res.json({message: 'success', user: req.query.userId })
})
```

Then to host it, wrap it in your service provider's wrapper.

Below is an example using the `ExpressWrapper.wrap()`:

```
const app = express()
app.use(ExpressWrapper.wrap(express.Router(), router))
app.listen(4000)
```

More provider examples are available below.

# Provider wrappers & Building your own

Supported provider wrappers and their example usages:

- ✅ [`ExpressWrapper`](https://github.com/mountain-pass/server-agnostic-functions/tree/main/examples/express/index.ts)
- ✅ [`CloudflareWrapper`](https://github.com/mountain-pass/server-agnostic-functions/tree/main/examples/cloudflare/src/index.ts)
- ❓ *Your Provider?*

## Building your own Provider wrapper

Don't see your provider? Have a go at writing your own, it's actually very easy! Start with the [ExpressWrapper](src/providers/ExpressWrapper.ts) as an example.

Once it's ready, please submit a PR back to the repo, so the entire community can benefit!

The wrapper should be as lightweight and efficient as possible. Avoid adding unneccessary libraries or code.

### Conventions

The `STATEFUL_MODE` environment variable should be set to true, if a stateful hosting framework is being used. This allows functions to know whether they need to clean up shared resources.

```
process.env.STATEFUL_MODE = 'true'
```

# Notes

- The `AgnosticRouter` can take Type arguments, for the underlying `Request` and `Response` types. These are then provided via the `underlying` property, on the `HttpRequest` and `HttpResponse` handler parameters.

- The `AgnosticRouter` does not (currently) support nesting child `AgnosticRouter`s.

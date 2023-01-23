# @mountainpass_oss/server-agnostic-functions

Provides an interface for writing server-agnostic (serverless) functions.

# Introduction

The name "serverless functions" is a misnomer - there's always a server involved. The name was intended to demonstrate that the developer was shielded from the operational efforts and concerns of having to host and maintain a server.

Being agnostic of the server implementation is the ultimate goal!

**Vendor Lock In**

Ok... thats great... however every service provider that I've come across, still imposes their own method signatures and functional behaviours on the developer - which ultimately leads to vendor lock in. 

It's an unspoken fact: "Vendors love vendor lock in"

Good luck to your future self when you have to migrate your ecosystem to a different provider because of pricing/system limitations/library incompatibilities/etc  (** *without comprehensive integration tests in place*).

**Routing**

Some providers do **not** support hosting multiple functions. Some require you to use their bespoke Router implementation. While others ask you to create YAML configurations. Bleagh!

**Testing**

Some providers require you to install their command line utilities, so you can test and develop locally. Bleagh!

# Problem Outline

## Problem: 

Every service provider has reinvented it's own serverless function interfaces - which is the opposite of being "provider agnostic". (Bad for reasons above.)

## Our Solution:

To insulate and simplify the development of functions - this library provides a generic `AgnosticRouter` class (and `HttpRequest`, `HttpResponse` interfaces), so that functions can be built using a standard (HTTP) interface, agnostic of the underlying runtime implementation.

Adding another "standard" to the mix without providing integrations would be redundant. So, we aim to provide API Router wrappers for all function providers.

# Example Usage

Here is a simple example, of creating an `AgnosticRouter` (and hosting it with Express).

```javascript
import { AgnosticRouter } from '<libraryNameTbd>/common/AgnosticRouter';
import { wrap } from '<libraryNameTbd>/providers/ExpressWrapper';

// (provider agnostic code starts here...)

// create a router for your hosting framework of choice...
const router = new AgnosticRouter()

// create your request handlers...
router.get('/users/{userId}', (req, res) => {
    res.json({message: 'success', user: req.params.userId })
})
router.get('/services/getUsersByQueryId', (req, res) => {
    res.json({message: 'success', user: req.query.userId })
})

// (provider agnostic code ends here...)

// then use the router in your server hosting framework
const app = express()
app.use(wrap(router))
app.listen(4000, () => console.log('Listening on port 4000'))
```

# Notes

- The `AgnosticRouter` can take Type arguments, for the underlying `Request` and `Response` types. These are then provided via the `underlying` property, on the `HttpRequest` and `HttpResponse` handler parameters.

- The `AgnosticRouter` does not (currently) support nesting child `AgnosticRouter`s.

# Provider wrappers & Building your own

Supported provider wrappers:

- [x] Express
- [ ] Cloudflare Workers
- [ ] AWS Serverless Functions
- [ ] *Your Provider?*

## Building your own Provider wrapper

Don't see your provider? Have a go at writing your own, it's actually very easy! Start with the [ExpressWrapper](src/providers/ExpressWrapper.ts) as an example.

Once it's ready, please submit a PR back to the repo, so the entire community can benefit!

The wrapper should be as lightweight and efficient as possible. Avoid adding unneccessary libraries or code.

### Conventions

The `STATEFUL_MODE` environment variable should be set to true, if a stateful hosting framework is being used. This allows functions to know whether they need to clean up shared resources.

```
process.env.STATEFUL_MODE = 'true'
```
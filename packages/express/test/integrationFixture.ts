#!/usr/bin/env ts-node -P tsconfig.test.json

// Run with ./test/integrationFixture.ts

import express from 'express'
import { diagnosticRouter } from '@mountainpass/server-agnostic-functions-core'
import { ExpressWrapper } from '../src/providers/ExpressWrapper'

const app = express()
app.use(new ExpressWrapper().wrap(diagnosticRouter()))
app.listen(3000, () => console.log('listening on port 3000'))

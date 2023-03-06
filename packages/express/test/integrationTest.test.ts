import {
  verifyByCallingRunningHttpServer,
  waitForStartup
} from '@mountainpass/server-agnostic-functions-core/diagnostics'
import { after, before, describe, it } from 'mocha'
import { spawn } from 'node:child_process'
import path from 'path'
import { setTimeout } from 'timers/promises'

describe('ExpressWrapper', () => {
  let command: any

  before(async () => {
    command = spawn('ts-node', [path.join(__dirname, 'integrationFixture.ts')])
    command.stdout.pipe(process.stdout)
    command.stderr.pipe(process.stderr)
  })

  after(async () => {
    await setTimeout(1000)
    command.kill()
  })

  it('running integration tests should pass', async () => {
    const host = 'http://localhost:3000'
    await waitForStartup(host)
    await verifyByCallingRunningHttpServer(host)
  })
})

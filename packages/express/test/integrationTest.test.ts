import { verifyByCallingRunningHttpServer } from '@mountainpass/server-agnostic-functions-diagnostics'
import { after, before, describe, it } from 'mocha'
import { spawn } from 'node:child_process'
import path from 'path'
import { setTimeout } from 'timers/promises'

/**
 * Starts the server, runs the integration test, then stops the server.
 */
describe('ExpressWrapper IntegrationTest', () => {
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

  it('running integration tests should pass', () => verifyByCallingRunningHttpServer()).timeout(10000)
})

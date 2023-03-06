import { verifyByCallingRunningHttpServer } from '@mountainpass/server-agnostic-functions-core'
import { spawn } from 'node:child_process'
import { setTimeout } from 'timers/promises'

/**
 * Starts the server, runs the integration test, then stops the server.
 */
const init = async () => {
  let command: any
  try {
    command = spawn('npm', ['run', 'start'])
    command.stdout.pipe(process.stdout)
    command.stderr.pipe(process.stderr)

    // verify the endpoint
    await verifyByCallingRunningHttpServer(100, 'http://localhost:3000')

  } finally {
    await setTimeout(1000)
    command.kill()
  }
}

init()
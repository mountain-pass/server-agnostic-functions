import { verifyByCallingRunningHttpServer } from '@mountainpass/server-agnostic-functions-diagnostics'
import { spawn } from 'node:child_process'
import { setTimeout } from 'timers/promises'

/**
 * Starts the server, runs the integration test, then stops the server.
 */
const init = async () => {
  let command: any
  let exitCode = 0
  try {
    command = spawn('npm', ['run', 'start'])
    command.stdout.pipe(process.stdout)
    command.stderr.pipe(process.stderr)

    // verify the endpoint
    await verifyByCallingRunningHttpServer(100)
  } catch (error: any) {
    console.error(`Caught error in integration test: ${error.message}`)
    exitCode = 1
  }

  await setTimeout(500)
  command.kill()
  process.exit(exitCode)
}

init()
/**
 * Admin account recovery — run when you are locked out of /admin.
 *
 * Usage (needs DATABASE_URL and PAYLOAD_SECRET in the environment, the same
 * values the deployed app uses):
 *
 *   npx payload run scripts/admin-recovery.ts list
 *   npx payload run scripts/admin-recovery.ts reset <email>
 *   npx payload run scripts/admin-recovery.ts unlock <email>
 *   npx payload run scripts/admin-recovery.ts create <email>
 *   npx payload run scripts/admin-recovery.ts test-email <to-address>
 *
 * `list` recovers a forgotten admin address. `reset` sets a new password
 * through Payload's own hashing (never write the hash column by hand) and
 * clears any lockout. `test-email` sends through the configured adapter and
 * reports what actually happened, which is the quickest way to find out why
 * a forgot-password email never arrived.
 *
 * The password is read from the NEW_PASSWORD environment variable, or prompted
 * for with the input hidden — it is never passed as an argument, so it stays
 * out of shell history and the process list.
 *
 * This script grants full admin access, but it requires DATABASE_URL and
 * PAYLOAD_SECRET to run — anyone holding those already controls the
 * installation. Run it from a trusted machine and treat the output as
 * sensitive.
 */
import { getPayload } from 'payload'
import config from '@payload-config'
import readline from 'node:readline'

const [command, target] = process.argv.slice(2)

const usage = () => {
  console.log(`
Admin recovery commands:

  list                     Show every admin account (recovers a forgotten email)
  reset <email>            Set a new password and clear any lockout
  unlock <email>           Clear a failed-login lockout, keeping the password
  create <email>           Create a new admin account
  test-email <address>     Send a test email through the configured adapter

The password is taken from NEW_PASSWORD, or prompted for if that is unset.
`)
}

/** Prompt without echoing what is typed. */
const promptHidden = (question: string): Promise<string> =>
  new Promise((resolve) => {
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout })
    const asMutable = rl as unknown as { _writeToOutput: (s: string) => void }
    const original = asMutable._writeToOutput.bind(rl)
    let silenced = false

    asMutable._writeToOutput = (chunk: string) => {
      if (!silenced) original(chunk)
    }

    process.stdout.write(question)
    silenced = true

    rl.question('', (answer) => {
      silenced = false
      process.stdout.write('\n')
      rl.close()
      resolve(answer)
    })
  })

const MIN_PASSWORD_LENGTH = 12

const requireStrong = (password: string): string => {
  if (password.length < MIN_PASSWORD_LENGTH) {
    throw new Error(
      `Password must be at least ${MIN_PASSWORD_LENGTH} characters. Use a password manager.`,
    )
  }
  return password
}

const getPassword = async (): Promise<string> => {
  const fromEnv = process.env.NEW_PASSWORD
  if (fromEnv) return requireStrong(fromEnv)

  const first = await promptHidden('New password (input hidden): ')
  const second = await promptHidden('Confirm password: ')

  if (first !== second) throw new Error('Passwords did not match.')

  return requireStrong(first)
}

const run = async () => {
  if (!command || command === 'help') {
    usage()
    return
  }

  const payload = await getPayload({ config })

  const findByEmail = async (email: string) => {
    const { docs } = await payload.find({
      collection: 'users',
      where: { email: { equals: email } },
      limit: 1,
      showHiddenFields: true,
    })
    return docs[0]
  }

  switch (command) {
    case 'list': {
      const { docs, totalDocs } = await payload.find({
        collection: 'users',
        limit: 100,
        sort: 'createdAt',
        showHiddenFields: true,
      })

      if (totalDocs === 0) {
        console.log(
          '\nNo admin accounts exist. Either the app is pointed at the wrong database,\n' +
            'or none was ever created — visit /admin to create the first user, or run:\n' +
            '  npx payload run scripts/admin-recovery.ts create <email>\n',
        )
        return
      }

      console.log(`\n${totalDocs} admin account(s):\n`)
      for (const user of docs) {
        const record = user as typeof user & { lockUntil?: string; loginAttempts?: number }
        const lockedUntil = record.lockUntil ? new Date(record.lockUntil) : null
        const locked = lockedUntil && lockedUntil > new Date()
        console.log(`  ${user.email}`)
        console.log(`    name:    ${user.name || '(none)'}`)
        console.log(`    created: ${user.createdAt}`)
        console.log(`    failed logins: ${record.loginAttempts ?? 0}`)
        if (locked) {
          console.log(`    LOCKED until ${lockedUntil.toISOString()} — run: unlock ${user.email}`)
        }
        console.log('')
      }
      return
    }

    case 'reset': {
      if (!target) throw new Error('Usage: reset <email>')

      const user = await findByEmail(target)
      if (!user) {
        throw new Error(
          `No admin account with email "${target}". Run \`list\` to see the real addresses.`,
        )
      }

      const password = await getPassword()

      await payload.update({
        collection: 'users',
        id: user.id,
        data: { password, loginAttempts: 0, lockUntil: null } as Record<string, unknown>,
        overrideAccess: true,
      })

      console.log(`\nPassword reset for ${target}. Any lockout has been cleared.`)
      console.log('Sign in at /admin and change it again from the account page if you like.\n')
      return
    }

    case 'unlock': {
      if (!target) throw new Error('Usage: unlock <email>')

      const user = await findByEmail(target)
      if (!user) throw new Error(`No admin account with email "${target}".`)

      await payload.update({
        collection: 'users',
        id: user.id,
        data: { loginAttempts: 0, lockUntil: null } as Record<string, unknown>,
        overrideAccess: true,
      })

      console.log(`\nLockout cleared for ${target}. The existing password still applies.\n`)
      return
    }

    case 'create': {
      if (!target) throw new Error('Usage: create <email>')

      if (await findByEmail(target)) {
        throw new Error(`An account with email "${target}" already exists — use \`reset\` instead.`)
      }

      const password = await getPassword()

      await payload.create({
        collection: 'users',
        data: { email: target, password, name: 'Administrator' },
        overrideAccess: true,
      })

      console.log(`\nCreated admin account ${target}. Sign in at /admin.\n`)
      return
    }

    case 'test-email': {
      if (!target) throw new Error('Usage: test-email <address>')

      if (!process.env.RESEND_API_KEY) {
        console.log(
          '\nRESEND_API_KEY is not set, so Payload has no email adapter configured.\n' +
            'Nothing is sent over the network — password-reset mail is written to the\n' +
            'server log instead. That alone explains a reset email that never arrives.\n',
        )
      }

      try {
        await payload.sendEmail({
          to: target,
          subject: 'Test email from the incident portal',
          text: 'If you received this, outbound email is working.',
        })
        console.log(`\nsendEmail() completed without error for ${target}.`)
        console.log(
          'If nothing arrives, check the Resend dashboard logs — a send that Resend\n' +
            'rejects (usually an unverified From domain) can still resolve here.\n',
        )
      } catch (error) {
        console.error('\nsendEmail() failed:\n', error)
        console.error(
          '\nMost common causes: EMAIL_FROM_ADDRESS is on a domain not verified in\n' +
            'Resend, or RESEND_API_KEY is wrong.\n',
        )
        process.exitCode = 1
      }
      return
    }

    default:
      usage()
      throw new Error(`Unknown command: ${command}`)
  }
}

// Top-level await, not a floating promise: `payload run` exits as soon as the
// module finishes evaluating, so an un-awaited run() would never execute.
try {
  await run()
  process.exit(process.exitCode ?? 0)
} catch (error) {
  console.error('\n' + (error instanceof Error ? error.message : String(error)) + '\n')
  process.exit(1)
}

import type { CollectionConfig } from 'payload'

import { authenticated } from '../../access/authenticated'
import { logAudit } from '../../hooks/auditLog'

export const Users: CollectionConfig = {
  slug: 'users',
  access: {
    admin: authenticated,
    create: authenticated,
    delete: authenticated,
    read: authenticated,
    update: authenticated,
  },
  admin: {
    defaultColumns: ['name', 'email'],
    useAsTitle: 'name',
  },
  auth: {
    cookies: {
      sameSite: 'Lax',
      secure: process.env.NODE_ENV === 'production',
    },
    lockTime: 10 * 60 * 1000, // lock account for 10 minutes
    maxLoginAttempts: 5,
    tokenExpiration: 2 * 60 * 60, // 2 hour sessions
  },
  hooks: {
    afterLogin: [
      async ({ req, user }) => {
        await logAudit({ action: 'login', payload: req.payload, req, userId: user?.id })
        return user
      },
    ],
    afterLogout: [
      async ({ req }) => {
        await logAudit({ action: 'logout', payload: req.payload, req, userId: req.user?.id })
      },
    ],
    afterForgotPassword: [
      async ({ args }) => {
        const req: typeof args.req = args?.req
        if (req?.payload) {
          await logAudit({
            action: 'forgot-password',
            detail: { email: args?.data?.email },
            payload: req.payload,
            req,
          })
        }
      },
    ],
  },
  fields: [
    {
      name: 'name',
      type: 'text',
    },
  ],
  timestamps: true,
}

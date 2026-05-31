import { Router } from 'express'
import { z } from 'zod'
import { prisma } from '../lib/prisma.js'
import { authenticate, AuthRequest } from '../middleware/authenticate.js'

export const authRouter = Router()

// Sync Supabase user with our public.User table
authRouter.post('/sync', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const { userId, email } = req.user!
    
    const user = await prisma.user.upsert({
      where: { id: userId },
      update: { email },
      create: { id: userId, email, passwordHash: '' }, // No password hash needed for OAuth/Supabase users
    })
    
    res.json({ ok: true, data: user })
  } catch (err) {
    next(err)
  }
})

const profileSchema = z.object({
  username: z.string().min(3).max(30).regex(/^[a-zA-Z0-9_]+$/).optional(),
  bioStatus: z.string().max(140).optional(),
})

authRouter.patch('/profile', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const { userId } = req.user!
    const body = profileSchema.parse(req.body)

    const user = await prisma.user.update({
      where: { id: userId },
      data: {
        ...(body.username ? { username: body.username } : {}),
        ...(body.bioStatus !== undefined ? { bioStatus: body.bioStatus } : {}),
      },
      select: { id: true, email: true, username: true, bioStatus: true, avatarUrl: true }
    })

    res.json({ ok: true, data: user })
  } catch (err) {
    next(err)
  }
})

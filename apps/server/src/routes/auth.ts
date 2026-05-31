import { Router } from 'express'
import { z } from 'zod'
import { prisma } from '../lib/prisma.js'
import { authenticate, AuthRequest } from '../middleware/authenticate.js'

export const authRouter = Router()

// Sync Supabase user with our public.User table
authRouter.post('/sync', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const { userId, email } = req.user!
    console.log(`[AuthSync] Syncing user ${email} (${userId})`)
    
    const user = await prisma.user.upsert({
      where: { id: userId },
      update: { email },
      create: { id: userId, email, passwordHash: '' },
    })
    
    console.log(`[AuthSync] Success for ${email}`)
    res.json({ ok: true, data: user })
  } catch (err) {
    console.error(`[AuthSync] Error for ${req.user?.email}:`, err)
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
    console.log(`[ProfileUpdate] Updating user ${userId}:`, body)

    const user = await prisma.user.update({
      where: { id: userId },
      data: {
        ...(body.username ? { username: body.username } : {}),
        ...(body.bioStatus !== undefined ? { bioStatus: body.bioStatus } : {}),
      },
      select: { id: true, email: true, username: true, bioStatus: true, avatarUrl: true }
    })

    console.log(`[ProfileUpdate] Success for ${userId}`)
    res.json({ ok: true, data: user })
  } catch (err) {
    console.error(`[ProfileUpdate] Error for ${req.user?.userId}:`, err)
    next(err)
  }
})

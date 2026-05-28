import { Router } from 'express'
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

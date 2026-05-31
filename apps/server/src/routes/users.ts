import { Router } from 'express'
import { prisma } from '../lib/prisma.js'
import { authenticate } from '../middleware/authenticate.js'

export const usersRouter = Router()

usersRouter.get('/', authenticate, async (_req, res, next) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        username: true,
        bioStatus: true,
        avatarUrl: true,
      },
      orderBy: { username: 'asc' }
    })
    res.json({ ok: true, data: users })
  } catch (err) {
    next(err)
  }
})

import { Router } from 'express'
import { z } from 'zod'
import { prisma } from '../lib/prisma.js'
import { authenticate, AuthRequest } from '../middleware/authenticate.js'

export const messagesRouter = Router()

// GET /api/messages/:userId - Get conversation with a specific user
messagesRouter.get('/:userId', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const currentUserId = req.user!.userId
    const otherUserId = req.params['userId']

    if (!otherUserId) {
      res.status(400).json({ ok: false, error: 'Target user ID required' })
      return
    }

    const messages = await prisma.message.findMany({
      where: {
        OR: [
          { senderId: currentUserId, receiverId: otherUserId },
          { senderId: otherUserId, receiverId: currentUserId },
        ]
      },
      orderBy: { createdAt: 'asc' },
      include: {
        sender: { select: { id: true, email: true, username: true, avatarUrl: true } },
        receiver: { select: { id: true, email: true, username: true, avatarUrl: true } },
      }
    })

    // Mark messages as read
    await prisma.message.updateMany({
      where: {
        senderId: otherUserId,
        receiverId: currentUserId,
        isRead: false,
      },
      data: { isRead: true }
    })

    res.json({ ok: true, data: messages })
  } catch (err) {
    next(err)
  }
})

// POST /api/messages - Send a new message
messagesRouter.post('/', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const senderId = req.user!.userId
    const { receiverId, content } = z.object({
      receiverId: z.string().cuid(),
      content: z.string().min(1),
    }).parse(req.body)

    const message = await prisma.message.create({
      data: {
        senderId,
        receiverId,
        content,
      },
      include: {
        sender: { select: { id: true, email: true, username: true, avatarUrl: true } },
        receiver: { select: { id: true, email: true, username: true, avatarUrl: true } },
      }
    })

    res.status(201).json({ ok: true, data: message })
  } catch (err) {
    next(err)
  }
})

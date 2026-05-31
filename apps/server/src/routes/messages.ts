import { Router } from 'express'
import { z } from 'zod'
import { prisma } from '../lib/prisma.js'
import { authenticate, AuthRequest } from '../middleware/authenticate.js'
import { sendEmailNotification } from '../lib/email.js'

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

    // Trigger Email Notification (Async)
    sendEmailNotification({
      to: message.receiver.email,
      subject: `New message from ${message.sender.username || message.sender.email}`,
      html: `
        <div style="font-family: sans-serif; padding: 20px; color: #111; max-width: 600px; border: 1px solid #eee; border-radius: 12px;">
          <h2 style="color: #111; margin-top: 0;">You've got a new message on Dev-Sync</h2>
          <p style="color: #444; font-size: 16px;"><strong>${message.sender.username || message.sender.email}</strong> sent you a message:</p>
          <div style="background: #f9f9f9; border-left: 4px solid #4fffb0; padding: 15px; margin: 20px 0; color: #333; font-style: italic; border-radius: 4px;">
            ${message.content}
          </div>
          <p style="margin-bottom: 25px;">
            <a href="${process.env['CLIENT_URL'] || 'http://localhost:3000'}/messages/${senderId}" 
               style="display: inline-block; background: #000; color: #fff; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: bold; font-size: 14px;">
              Reply on Dev-Sync
            </a>
          </p>
          <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
          <p style="color: #888; font-size: 11px; text-transform: uppercase; letter-spacing: 1px;">
            Sent by Dev-Sync — Collaborative Code Snippet Manager
          </p>
        </div>
      `
    }).catch(console.error)

    res.status(201).json({ ok: true, data: message })
  } catch (err) {
    next(err)
  }
})

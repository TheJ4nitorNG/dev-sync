import { Router } from 'express'
import { prisma } from '../lib/prisma.js'
import { authenticate } from '../middleware/authenticate.js'

export const usersRouter = Router()

// GET /api/users - List all users with stats
usersRouter.get('/', authenticate, async (_req, res, next) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        username: true,
        bioStatus: true,
        avatarUrl: true,
        _count: {
          select: { 
            snippets: true,
            savedSnippets: true,
          }
        }
      },
      orderBy: { username: 'asc' }
    })
    res.json({ ok: true, data: users })
  } catch (err) {
    next(err)
  }
})

// GET /api/users/:userId/saved - Get public collection of another user
usersRouter.get('/:userId/saved', authenticate, async (req, res, next) => {
  try {
    const { userId } = req.params
    if (!userId) { res.status(400).json({ ok: false, error: 'Missing userId' }); return }

    const savedSnippets = await prisma.savedSnippet.findMany({
      where: { userId },
      include: {
        snippet: {
          select: {
            id: true,
            title: true,
            language: true,
            updatedAt: true,
            owner: { select: { id: true, email: true, username: true, avatarUrl: true } },
            tags: { select: { tag: { select: { id: true, name: true, color: true } } } },
            savedBy: { select: { userId: true } }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    // Flatten tags for the frontend
    const items = savedSnippets.map(s => ({
      ...s.snippet,
      tags: s.snippet.tags.map(t => t.tag)
    }))

    res.json({ ok: true, data: items })
  } catch (err) {
    next(err)
  }
})

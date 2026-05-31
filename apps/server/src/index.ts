import express from 'express'
import 'dotenv/config'
import { createServer } from 'http'
import cors from 'cors'
import helmet from 'helmet'
import { Server } from 'socket.io'
import type {
  ClientToServerEvents,
  ServerToClientEvents,
  SocketData,
} from './lib/types.js'

import { authRouter } from './routes/auth.js'
import { snippetsRouter } from './routes/snippets.js'
import { tagsRouter } from './routes/tags.js'
import { foldersRouter } from './routes/folders.js'
import { usersRouter } from './routes/users.js'
import { messagesRouter } from './routes/messages.js'
import { setupSnippetSocket } from './socket/snippetSocket.js'
import { authenticate } from './middleware/authenticate.js'
import { errorHandler } from './middleware/errorHandler.js'

const app = express()
const httpServer = createServer(app)

const io = new Server<ClientToServerEvents, ServerToClientEvents, never, SocketData>(httpServer, {
  cors: {
    origin: true,
    methods: ['GET', 'POST'],
  },
})

// ── Middleware ───────────────────────────────────────────────────────────────
app.use(helmet({ contentSecurityPolicy: false }))
app.use(cors({
  origin: true,
  credentials: true,
}))
app.use(express.json())

// Request Logger
app.use((req, _res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`)
  next()
})

// ── Routes ───────────────────────────────────────────────────────────────────
app.get('/health', (_req, res) => res.json({ ok: true }))
app.use('/api/auth', authRouter)
app.use('/api/users', authenticate, usersRouter)
app.use('/api/messages', authenticate, messagesRouter)
app.use('/api/snippets', authenticate, snippetsRouter)
app.use('/api/tags', authenticate, tagsRouter)
app.use('/api/folders', authenticate, foldersRouter)

// ── Socket.io ────────────────────────────────────────────────────────────────
setupSnippetSocket(io)

// ── Catch-all 404 ────────────────────────────────────────────────────────────
app.use((req, res) => {
  console.log(`[404] ${req.method} ${req.url}`)
  res.status(404).json({ ok: false, error: 'Route not found' })
})

// ── Error handler ─────────────────────────────────────────────────────────────
app.use(errorHandler)

const PORT = Number(process.env['PORT'] ?? 4000)
httpServer.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀  Server running on http://0.0.0.0:${PORT}`)
})

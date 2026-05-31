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
import { errorHandler } from './middleware/errorHandler.js'
import { authenticate } from './middleware/authenticate.js'
import { registerSnippetSocket } from './socket/snippetSocket.js'

const app = express()
const httpServer = createServer(app)

// ── Socket.io ────────────────────────────────────────────────────────────────
const allowedOrigins = (process.env['CLIENT_URL'] ?? 'http://localhost:5173').split(',')

const io = new Server<
  ClientToServerEvents,
  ServerToClientEvents,
  Record<string, never>,
  SocketData
>(httpServer, {
  cors: { origin: allowedOrigins },
})

registerSnippetSocket(io)

// ── Express middleware ─────────────────────────────────────────────────────────────
app.use(helmet())
app.use(cors({ origin: allowedOrigins }))
app.use(express.json())

app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`)
  next()
})

// ── Routes ───────────────────────────────────────────────────────────────────
app.use('/api/auth', authRouter)
app.use('/api/snippets', authenticate, snippetsRouter)
app.use('/api/tags', authenticate, tagsRouter)
app.use('/api/folders', authenticate, foldersRouter)

app.get('/health', (_req, res) => res.json({ ok: true }))

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

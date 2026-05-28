import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  const email = 'test@example.com'
  const password = 'password123'
  const passwordHash = await bcrypt.hash(password, 10)

  const user = await prisma.user.upsert({
    where: { email },
    update: {},
    create: {
      email,
      passwordHash,
    },
  })

  // Create some snippets to show off the masonry grid
  const snippets = [
    {
      title: 'Vite React Template',
      content: 'import React from "react"\nimport ReactDOM from "react-dom/client"\n\nReactDOM.createRoot(document.getElementById("root")).render(<App />)',
      language: 'typescript',
    },
    {
      title: 'Python Fibonacci',
      content: 'def fib(n):\n    if n <= 1: return n\n    return fib(n-1) + fib(n-2)',
      language: 'python',
    },
    {
      title: 'Docker Compose Postgres',
      content: 'version: "3.9"\nservices:\n  db:\n    image: postgres:16-alpine',
      language: 'yaml',
    },
    {
      title: 'Zustand Auth Store',
      content: 'export const useAuthStore = create((set) => ({\n  user: null,\n  login: (user) => set({ user }),\n}))',
      language: 'typescript',
    }
  ]

  for (const sn of snippets) {
    await prisma.snippet.create({
      data: {
        ...sn,
        ownerId: user.id,
      }
    })
  }

  console.log('Test user created: test@example.com / password123')
  console.log('Mock snippets created.')
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())

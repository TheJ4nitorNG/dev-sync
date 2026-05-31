import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
  const users = await prisma.user.findMany({
    include: { _count: { select: { snippets: true } } }
  })
  console.log('--- Users ---')
  users.forEach(u => console.log(`${u.email} (ID: ${u.id}) - Snippets: ${u._count.snippets}`))

  const snippets = await prisma.snippet.findMany({
    include: { owner: { select: { email: true } } }
  })
  console.log('\n--- Snippets ---')
  snippets.forEach(s => console.log(`[${s.id}] ${s.title} (Owner: ${s.owner.email})`))
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())

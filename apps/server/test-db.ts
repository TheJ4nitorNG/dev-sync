import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function main() {
  const snippets = await prisma.snippet.findMany();
  if (snippets.length > 0) {
    console.log("Snippet length:", snippets[0].content.length);
    console.log("Snippet preview:\n", snippets[0].content.substring(0, 500));
  } else {
    console.log("No snippets");
  }
}
main().finally(() => prisma.$disconnect());

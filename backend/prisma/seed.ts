import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  await prisma.sample.createMany({
    data: [
      { title: "First sample", content: "Hello from Prisma!" },
      { title: "Second sample", content: "More content here" },
    ],
  });
}

main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
  });

// backend/prisma/seed.ts
import { PrismaClient } from "@prisma/client";
import { createHash } from "crypto";

const prisma = new PrismaClient();

// 簡易的に userId を生成（IPなし、日付ベース）
const fakeUserId = (name: string) =>
  createHash("sha1").update(name).digest("hex").slice(0, 8);

async function main() {
  await prisma.thread.create({
    data: {
      title: "最初のスレッド",
      comments: {
        create: [
          { user: "名無しさん", content: "こんにちは！", userId: fakeUserId("名無しさん") },
          { user: "テスト太郎", content: "これはサンプルコメントです", userId: fakeUserId("テスト太郎") },
        ],
      },
    },
  });

  await prisma.thread.create({
    data: {
      title: "2つ目のスレッド",
      comments: {
        create: [
          { user: "Alice", content: "わーい", userId: fakeUserId("Alice") },
          { user: "Bob", content: "テストコメント", userId: fakeUserId("Bob") },
          { user: "Charlie", content: "もっと書き込みたい", userId: fakeUserId("Charlie") },
        ],
      },
    },
  });
}

main()
  .then(() => console.log("✅ Seed data created!"))
  .catch((e) => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
  });

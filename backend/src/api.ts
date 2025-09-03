import { Hono } from "hono";
import prisma from "./db.js";

export const api = new Hono();

// スレッド一覧取得
api.get("/threads", async (c) => {
  const threads = await prisma.thread.findMany({
    include: {
      comments: true,
    },
  });
  return c.json(threads);
});

// 新しく追加する POST /threads
api.post("/threads", async (c) => {
  const body = await c.req.json<{ title: string }>();

  if (!body.title) {
    return c.json({ error: "Title is required" }, 400);
  }

  const thread = await prisma.thread.create({
    data: {
      title: body.title,
    },
  });

  return c.json(thread, 201);
});

// コメント投稿
api.post("/threads/:threadId/comments", async (c) => {
  const threadId = c.req.param("threadId");
  const { content, user, email } = await c.req.json<{ content: string; user?: string; email?: string }>();

  try {
    const comment = await prisma.comment.create({
      data: {
        content,
        user: user || "名無し",
        email,
        threadId,
      },
    });
    return c.json(comment, 201);
  } catch (error) {
    console.error(error);
    return c.json({ error: "コメント作成に失敗しました" }, 500);
  }
});

// コメント一覧取得
api.get("/threads/:threadId/comments", async (c) => {
  const threadId = c.req.param("threadId");
  try {
    const comments = await prisma.comment.findMany({
      where: { threadId },
      orderBy: { createdAt: "asc" },
    });
    return c.json(comments);
  } catch (error) {
    console.error(error);
    return c.json({ error: "コメント取得に失敗しました" }, 500);
  }
});

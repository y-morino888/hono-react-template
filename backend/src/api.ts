import { Hono } from "hono";
import prisma from "./db.js";
import {nanoid }from "nanoid";


export const api = new Hono();

// Samples 一覧
api.get("/samples", async (c) => {
  const samples = await prisma.sample.findMany({ orderBy: { id: "desc" } });
  return c.json(samples);
});

// Samples 単体取得
api.get("/samples/:id", async (c) => {
  const id = Number(c.req.param("id"));
  const sample = await prisma.sample.findUnique({ where: { id } });
  if (!sample) return c.json({ error: "Not found" }, 404);
  return c.json(sample);
});

// 動作確認用
api.get("/hello", (c) => c.json({ message: "Hello API!" }));

// スレッド作成（最初のコメント付き）
api.post("/threads", async (c) => {
  const body = await c.req.json<{
    title: string;
    content: string;
    user?: string;
    email?: string;
  }>();

  if (!body.title || !body.content) {
    return c.json({ error: "Title and content are required" }, 400);
  }

  const thread = await prisma.thread.create({
    data: {
      title: body.title,
      comments: {
        create: {
          content: body.content,
          user: body.user || "名無し",
          email: body.email,
          userId: nanoid(8), // ← OK
        },
      },
    },
    include: {
      comments: true,
    },
  });

  return c.json(thread, 201);
});

// コメント投稿
api.post("/threads/:threadId/comments", async (c) => {
  const threadId = c.req.param("threadId");

  const { content, user, email, userId: bodyUserId } = await c.req.json<{ 
    content: string; 
    user?: string; 
    email?: string;
    userId?: string;
  }>();

  const userId = bodyUserId ?? nanoid(8); // リクエストに無ければ自動生成

  try {
    const comment = await prisma.comment.create({
      data: {
        userId,
        user: user ?? "名無し",
        email,
        content,
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

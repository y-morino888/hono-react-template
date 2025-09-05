// backend/src/api.ts
import { Hono } from "hono";
import prisma from "./db.js";
import { createHash } from "node:crypto";

export const api = new Hono();

/* ========= 動作確認 ========= */
api.get("/hello", (c) => c.json({ message: "Hello API!" }));

/* ========= Samples ========= */
// 一覧
api.get("/samples", async (c) => {
  const samples = await prisma.sample.findMany({ orderBy: { id: "desc" } });
  return c.json(samples);
});

// 単体取得（Sample は Int 主キー）
api.get("/samples/:id", async (c) => {
  const id = Number(c.req.param("id"));
  const sample = await prisma.sample.findUnique({ where: { id } });
  if (!sample) return c.json({ error: "Not found" }, 404);
  return c.json(sample);
});

/* ========= Threads / Comments ========= */

// スレッド一覧（最新が先）+ コメントも含める（古い順）
api.get("/threads", async (c) => {
  try {
    const threads = await prisma.thread.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        comments: {
          orderBy: { createdAt: "asc" }, // 古い順に
          take: 3, // 最新3件とかにするならここを調整
        },
      },
    });
    return c.json(threads);
  } catch (error) {
    console.error(error);
    return c.json({ error: "スレッド取得に失敗しました" }, 500);
  }
});

// スレッド単体（コメント付き）
api.get("/threads/:threadId", async (c) => {
  const threadId = c.req.param("threadId");
  try {
    const thread = await prisma.thread.findUnique({
      where: { id: threadId },
      include: {
        comments: {
          orderBy: { createdAt: "asc" },
        },
      },
    });
    if (!thread) {
      return c.json({ error: "Not found" }, 404);
    }
    return c.json(thread);
  } catch (error) {
    console.error("🔥 thread取得エラー:", error);
    return c.json({ error: "スレッド取得に失敗しました" }, 500);
  }
});


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

  // 表示用 User ID（同一日×同一IPで同じ値）
  const ip =
    c.req.header("x-forwarded-for") ||
    c.req.header("x-real-ip") ||
    "0.0.0.0";
  const today = new Date().toISOString().slice(0, 10);
  const userId = createHash("sha1").update(ip + today).digest("hex").slice(0, 8);

  try {
    const thread = await prisma.thread.create({
      data: {
        title: body.title,
        comments: {
          create: {
            content: body.content,
            user: body.user || "名無し",
            email: body.email,
            userId, // ← 保存
          },
        },
      },
      include: { comments: true },
    });
    return c.json(thread, 201);
  } catch (error) {
    console.error("🔥 thread作成エラー:", error);
    return c.json({ error: "スレッド作成に失敗しました" }, 500);
  }
});

// コメント一覧
api.get("/threads/:threadId/comments", async (c) => {
  const threadId = c.req.param("threadId");
  try {
    const comments = await prisma.comment.findMany({
      where: { threadId },
      orderBy: { createdAt: "asc" },
    });
    return c.json(comments);
  } catch (error) {
    console.error("🔥 comments取得エラー:", error);
    return c.json({ error: "コメント取得に失敗しました" }, 500);
  }
});

// コメント投稿
api.post("/threads/:threadId/comments", async (c) => {
  const threadId = c.req.param("threadId");
  const { content, user, email } = await c.req.json<{
    content: string;
    user?: string;
    email?: string;
  }>();

  if (!content) return c.json({ error: "content is required" }, 400);

  // 表示用 User ID（同一日×同一IPで同じ値）
  const ip =
    c.req.header("x-forwarded-for") ||
    c.req.header("x-real-ip") ||
    "0.0.0.0";
  const today = new Date().toISOString().slice(0, 10);
  const userId = createHash("sha1").update(ip + today).digest("hex").slice(0, 8);

  try {
    const comment = await prisma.comment.create({
      data: {
        threadId,
        content,
        user: user || "名無し",
        email,
        userId, // ← 保存
      },
    });
    return c.json(comment, 201);
  } catch (error) {
    console.error("🔥 comment作成エラー:", error);
    return c.json({ error: "コメント作成に失敗しました" }, 500);
  }
});

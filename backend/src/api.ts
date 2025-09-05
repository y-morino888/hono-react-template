// backend/src/api.ts
import { Hono } from "hono";
import prisma from "./db.js";
import { cors } from "hono/cors";
import { createHash } from "node:crypto";

export const api = new Hono();

api.use("/*", cors()); // CORS有効化

/* ========= 動作確認 ========= */
api.get("/hello", (c) => c.json({ message: "Hello API!" }));

/* ========= Samples ========= */
// 一覧
api.get("/samples", async (c) => {
  try {
    const samples = await prisma.sample.findMany({ orderBy: { id: "desc" } });
    return c.json(samples);
  } catch (error) {
    console.error("🔥 samples一覧エラー:", error);
    return c.json({ error: "取得に失敗しました" }, 500);
  }
});

// 単体取得（Sample は Int 主キー）
api.get("/samples/:id", async (c) => {
  const id = Number(c.req.param("id"));
  if (isNaN(id)) return c.json({ error: "Invalid id" }, 400);
  try {
    const sample = await prisma.sample.findUnique({ where: { id } });
    if (!sample) return c.json({ error: "Not found" }, 404);
    return c.json(sample);
  } catch (error) {
    console.error("🔥 sample取得エラー:", error);
    return c.json({ error: "取得に失敗しました" }, 500);
  }
});

/* ========= Threads / Comments ========= */

// スレッド一覧（最新順）+ コメントも含める（古い順）
api.get("/threads", async (c) => {
  try {
    const threads = await prisma.thread.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        comments: {
          orderBy: { createdAt: "asc" }, // 古い順
          take: 3, // プレビュー用に最新3件
        },
      },
    });
    return c.json(threads);
  } catch (error) {
    console.error("🔥 threads一覧エラー:", error);
    return c.json({ error: "スレッド一覧取得に失敗しました" }, 500);
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
    if (!thread) return c.json({ error: "Not found" }, 404);
    return c.json(thread);
  } catch (error) {
    console.error("🔥 thread取得エラー:", error);
    return c.json({ error: "スレッド取得に失敗しました" }, 500);
  }
});

// スレッド作成（最初のコメント付き）
api.post("/threads", async (c) => {
  const body = await c.req.json<{
    title?: string;
    content?: string;
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
            userId,
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
  const body = await c.req.json<{
    content?: string;
    user?: string;
    email?: string;
  }>();

  if (!body.content) return c.json({ error: "content is required" }, 400);

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
        content: body.content,
        user: body.user || "名無し",
        email: body.email,
        userId,
      },
    });
    return c.json(comment, 201);


  } catch (error) {
    console.error("🔥 comment作成エラー:", error);
    return c.json({ error: "コメント作成に失敗しました" }, 500);
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


// コメント削除（管理者用 → あぼーん化）
api.delete("/threads/:threadId/comments/:commentId", async (c) => {
  const { commentId } = c.req.param();

  // 認証トークン確認
  const token = c.req.header("authorization");
  if (token !== `Bearer ${process.env.ADMIN_TOKEN}`) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  try {
    await prisma.comment.update({
      where: { id: commentId },
      data: {
        content: "あぼーん",
        user: "あぼーん",
      },
    });
    return c.json({ success: true });
  } catch (error) {
    console.error("🔥 commentあぼーんエラー:", error);
    return c.json({ error: "コメントのあぼーんに失敗しました" }, 500);
  }
});

// 📌 削除依頼の新規作成
api.post("/delete-requests", async (c) => {
  try {
    const { threadId, commentId, reason } = await c.req.json();

    if (!commentId || !reason) {
      return c.json({ error: "commentId と理由は必須です" }, 400);
    }

    const request = await prisma.deleteRequest.create({
      data: {
        threadId,
        commentId,
        reason,
      },
    });

    return c.json(request);
  } catch (err) {
    console.error("削除依頼エラー:", err);
    return c.json({ error: "削除依頼に失敗しました" }, 500);
  }
});

// 📌 削除依頼一覧取得（管理者確認用）
api.get("/delete-requests", async (c) => {
  try {
    const requests = await prisma.deleteRequest.findMany({
      orderBy: { createdAt: "desc" },
    });
    return c.json(requests);
  } catch (err) {
    console.error("削除依頼取得エラー:", err);
    return c.json({ error: "取得に失敗しました" }, 500);
  }
});

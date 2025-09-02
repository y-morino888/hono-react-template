import { Hono } from "hono";
import prisma from "./db.js";

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

api.get("/hello", (c) => c.json({ message: "Hello API!" }));
api.get("/samples", async (c) => {
  const samples = await prisma.sample.findMany();
  return c.json(samples);
});

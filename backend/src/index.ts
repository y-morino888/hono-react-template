import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { api } from "./api.js";

const app = new Hono();

app.get("/", (c) => c.text("Hello Hono!"));

// ここで /api 配下に api.ts のルートをまとめてマウント
app.route("/api", api);

serve(
  {
    fetch: app.fetch,
    port: 3000,
  },
  (info) => {
    console.log(`Server is running on http://localhost:${info.port}`);
  }
);
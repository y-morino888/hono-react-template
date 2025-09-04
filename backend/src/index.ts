import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { cors } from "hono/cors"; // ← 追加
import { api } from "./api.js";

const app = new Hono();

// 🌐 CORS を有効化
app.use(
  "/*",
  cors({
    origin: "*", // 開発中は全許可
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  })
);

app.get("/", (c) => {
  return c.text("Hello Hono!");
});

app.route("/api", api);

serve(
  {
    fetch: app.fetch,
    port: 8787,
  },
  (info) => {
    console.log(`Server is running on http://localhost:${info.port}`);
  }
);

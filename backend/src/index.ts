import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { api } from "./api.js";

const app = new Hono();

app.get("/", (c) => {
  return c.text("Hello Hono!");
});
app.use("/*", cors());

app.get("/", (c) => c.text("Hello Hono!"));

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

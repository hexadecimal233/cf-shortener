import { CloudflareAdapter } from "elysia/adapter/cloudflare-worker";
import { Elysia } from "elysia";
import { html } from "@elysiajs/html";

import { stats } from "./routes/stats";
import { create } from "./routes/create";
import { index } from "./routes/index";
import { alias } from "./routes/alias";

export default new Elysia({
  adapter: CloudflareAdapter,
})
  .use(html())
  .use(stats)
  .use(create)
  .use(index)
  .use(alias)
  .compile(); // 支持 Cloudflare运行

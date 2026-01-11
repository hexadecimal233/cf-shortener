import { Html } from "@elysiajs/html";
import { env } from "cloudflare:workers";
import { errorTemplate, linkTemplate, template } from "../template";
import { zLinkData, zLinkDataCreate } from "../utils";
import Elysia from "elysia";
import z from "zod";

export const create = new Elysia().post(
  "/create",
  async ({ request, body, set }) => {
    // 检查密码是否正确 (留空自动跳过)
    if ((body.creation_password || "") !== env.PASSWORD) {
      set.status = 403;
      return errorTemplate("the password is wrong...", true);
    }

    // 如果没有自定义别名，生成 6 位随机字符
    const alias =
      body.alias && body.alias.trim().length > 0
        ? body.alias.trim()
        : Math.random().toString(36).substring(2, 8);

    // 检查是否已存在 (避免覆盖)
    const exists = await env.LINKS.get(alias);
    if (exists) {
      set.status = 400;
      return errorTemplate("link already exists", true);
    }

    const newLinkData = zLinkData.parse(body);

    // 存入 KV
    await env.LINKS.put(alias, JSON.stringify(newLinkData));

    const finalUrl = `${new URL(request.url).origin}/${alias}`;

    return template(
      "yo the link's all set^^",
      <>
        <p>
          your link is:
          {linkTemplate(finalUrl)}
        </p>
        <div class="nes-container with-title">
          <p class="title">warning</p>
          <p>
            please keep the link secure, cuz it will be gone once you leave this
            page!
          </p>
          <a
            href={`/stats/${alias}?key=${newLinkData.key}`}
            class="nes-btn is-primary"
          >
            see stats
          </a>
        </div>
        <div class="action-buttons">
          <a href="/" class="nes-btn">
            back to home
          </a>
        </div>
      </>
    );
  },
  {
    body: zLinkDataCreate.extend({
      alias: z.string().optional(),
      creation_password: z.string().optional(),
    }),
  }
);
